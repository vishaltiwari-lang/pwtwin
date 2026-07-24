import Link from "next/link";
import type { PageContent } from "@/lib/types";

export default function PageHeader({ page }: { page: PageContent }) {
  return (
    <header className="pageHeader">
      <div className="pageHeader__top">
        <span className="pageHeader__spine">
          <span className="pageHeader__dot" aria-hidden />
          {page.subject}
        </span>
        <Link href="/" className="pageHeader__back">
          ← Scan another
        </Link>
      </div>

      <h1 className="pageHeader__title">{page.title}</h1>

      <div className="pageHeader__meta">
        <span className="pageHeader__cite">
          {page.book} · {page.chapter} · p.{page.pageNumber}
        </span>
        <span className="chip">Scoped to this page</span>
      </div>

      <p className="pageHeader__concept">{page.concept}</p>
    </header>
  );
}
