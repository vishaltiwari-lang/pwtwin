import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  // lib/papers.ts reads digital-documents/*/paper.json with fs at runtime;
  // static tracing can't see those reads, so serverless bundles (Vercel)
  // must be told to include them explicitly.
  outputFileTracingIncludes: {
    "/api/chat": ["./digital-documents/*/paper.json"],
    "/p/[pageId]": ["./digital-documents/*/paper.json"],
  },
};

export default nextConfig;
