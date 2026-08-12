import Link from "next/link";
import { listPageSummaries } from "@/lib/content";
import Scanner from "@/components/Scanner";

export default function Dashboard() {
  const summaries = listPageSummaries();

  return (
    <main className="desk">
      <div className="device landing">
        <section className="hero">
          <span className="hero__badge">
            <span className="hero__logo">P</span>
            PW <b>Twin</b>
          </span>
          <h1 className="hero__title">
            Scan the page. Meet its <span className="mark">twin</span>.
          </h1>
          <p className="hero__sub">
            Every printed JEE &amp; NEET module page has a QR. Scan it to open that exact page&apos;s
            questions, mnemonics, cheat sheet and step-by-step solutions — and ask your doubts.
          </p>
        </section>

        <Scanner />

        <section className="demo">
          <p className="demo__label">No book handy? Try a sample page</p>
          <div className="demo__grid">
            {summaries.map((s) => (
              <Link
                key={s.id}
                href={`/p/${s.id}`}
                className="demoItem"
                data-subject={s.subject}
              >
                <span className="demoItem__spine" aria-hidden />
                <span className="demoItem__body">
                  <span className="demoItem__title">{s.title}</span>
                  <span className="demoItem__meta">
                    {s.subject} · {s.chapter} · p.{s.pageNumber}
                  </span>
                </span>
                <span className="demoItem__go" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <p className="landing__foot">
          Publishing these books? <Link href="/publisher">Generate the printable QR codes →</Link>
        </p>
      </div>
    </main>
  );
}
