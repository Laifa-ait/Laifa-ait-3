import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const previewDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(previewDirectory, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(previewDirectory, 'package.json'), 'utf8'));
const packageAliases = Object.keys(manifest.dependencies).map((name) => ({
  find: name,
  replacement: path.join(previewDirectory, 'node_modules', name),
}));

export default defineConfig({
  root: projectRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@/', replacement: `${projectRoot}/` },
      ...packageAliases,
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: false,
    watch: { ignored: ['**/node_modules/**', '**/.git/**', '**/docs/**', '**/k6/**'] },
  },
});
