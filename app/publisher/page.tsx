import Link from "next/link";
import type { Metadata } from "next";
import { listPageSummaries } from "@/lib/content";
import QrTile from "@/components/QrTile";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Publisher QR sheet — PW Twin",
  description: "Printable QR codes to place on each module page.",
};

export default function PublisherPage() {
  const summaries = listPageSummaries();

  return (
    <main className="desk" style={{ display: "block" }}>
      <div className="pub">
        <header className="pub__head">
          <p className="pub__eyebrow">Publisher tools</p>
          <h1 className="pub__title">Printable QR sheet</h1>
          <p className="pub__lede">
            Place one code on its matching module page before printing. When a student scans it,
            PW&nbsp;Twin opens that page&apos;s digital twin — its questions, mnemonics, cheat sheet,
            solutions and doubt chat. Try it now: open this on your laptop and scan a code with your
            phone.
          </p>
          <div className="pub__bar">
            <PrintButton />
            <Link href="/" className="btn btn--ghost">
              ← Back to app
            </Link>
          </div>
        </header>

        <div className="pub__grid">
          {summaries.map((s) => (
            <QrTile key={s.id} page={s} />
          ))}
        </div>
      </div>
    </main>
  );
}
