const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk("src");
const tRegex = /\bt\(\s*["'`]?([a-zA-Z0-9_.-]+)["'`]?/g;
const codeKeys = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  let match;
  const regex = /t\(\s*["']([a-zA-Z0-9_.-]+)["']/g;
  while ((match = regex.exec(content)) !== null) {
    codeKeys.add(match[1]);
  }
});

const fr = JSON.parse(fs.readFileSync("public/locales/fr.json", "utf8"));
const en = JSON.parse(fs.readFileSync("public/locales/en.json", "utf8"));
const ar = JSON.parse(fs.readFileSync("public/locales/ar.json", "utf8"));

const missingOrRaw = [];

codeKeys.forEach(k => {
  const v = fr[k];
  const isSnakeOrDot = /^[a-z0-9]+([_.-][a-z0-9]+)+$/i.test(k);
  if (isSnakeOrDot) {
    if (!v || v === k || /^[a-z0-9]+([_.-][a-z0-9]+)+$/i.test(v)) {
      missingOrRaw.push({ key: k, valueFr: v || null, valueEn: en[k] || null, valueAr: ar[k] || null });
    }
  }
});

console.log("Total missing or raw code keys matching xx_xx or xx.xx:", missingOrRaw.length);
fs.writeFileSync("/tmp/code_missing_or_raw.json", JSON.stringify(missingOrRaw, null, 2));
