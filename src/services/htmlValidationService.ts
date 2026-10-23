import path from "path";
import { existsSync } from "fs";
import { safeLogger } from "../utils/logger";

/**
 * Validates production HTML template structure and ensures all referenced JavaScript asset chunks exist on disk.
 */
export function validateProductionHtmlTemplate(content: string, distPath: string): boolean {
  if (!content || content.trim().length <= 50 || !content.includes('id="root"')) {
    return false;
  }

  // Deep verification: Extract ALL referenced /assets/*.js script chunks and ensure each exists on disk
  const scriptMatches = content.matchAll(/src=["'](\/assets\/[^"']+\.js)["']/gi);
  for (const match of scriptMatches) {
    if (match[1]) {
      const referencedJsPath = path.join(distPath, match[1].replace(/^\//, ""));
      if (!existsSync(referencedJsPath)) {
        safeLogger.error("[CRITICAL BUILD ERROR] Missing JS asset chunk in HTML template", {
          chunkName: path.basename(match[1]),
        });
        return false;
      }
    }
  }

  return true;
}
