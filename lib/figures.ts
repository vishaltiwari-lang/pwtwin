import { existsSync } from "node:fs";
import { join } from "node:path";

const SAFE_PAGE_ID = /^[a-z0-9][a-z0-9-]*$/;
const SAFE_PNG = /^[a-z0-9][a-z0-9-]*\.png$/;

/**
 * Resolves a /figures/<pageId>/<file> request to an absolute path inside
 * digital-documents/<pageId>/figures/, or null when the request is unsafe
 * (traversal, odd characters, non-png) or the file doesn't exist.
 */
export function resolveFigureFile(pageId: string, file: string): string | null {
  if (!SAFE_PAGE_ID.test(pageId) || !SAFE_PNG.test(file)) return null;
  const path = join(process.cwd(), "digital-documents", pageId, "figures", file);
  return existsSync(path) ? path : null;
}
