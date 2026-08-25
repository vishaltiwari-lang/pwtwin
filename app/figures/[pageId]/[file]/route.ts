import { readFileSync } from "node:fs";
import { resolveFigureFile } from "@/lib/figures";

export const runtime = "nodejs";

/** Serves digitized-paper figure crops from digital-documents/<pageId>/figures/. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string; file: string }> },
) {
  const { pageId, file } = await params;
  const path = resolveFigureFile(pageId, file);
  if (!path) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(readFileSync(path)), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
