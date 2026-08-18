// Generates a printable qr.png inside every digital-documents/<slug>/ folder.
// The QR encodes `${BASE_URL}/p/<slug>` — the same URL /publisher tiles use.
// Usage: npm run qr            (defaults to http://localhost:3000)
//        BASE_URL=https://pwtwin.example npm run qr
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const dir = join(process.cwd(), "digital-documents");

for (const entry of readdirSync(dir, { withFileTypes: true })) {
  if (!entry.isDirectory() || !existsSync(join(dir, entry.name, "paper.json"))) continue;
  const url = `${base}/p/${entry.name}`;
  const file = join(dir, entry.name, "qr.png");
  await QRCode.toFile(file, url, {
    margin: 1,
    width: 600,
    errorCorrectionLevel: "M",
    color: { dark: "#141b2e", light: "#ffffff" },
  });
  console.log(`${entry.name}: ${url} -> ${file}`);
}
