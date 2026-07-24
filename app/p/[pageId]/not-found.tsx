import Link from "next/link";

export default function PageNotFound() {
  return (
    <main className="desk">
      <div className="device">
        <div className="nf">
          <p className="nf__code">QR not recognised</p>
          <h1 className="nf__title">We couldn&apos;t find that page</h1>
          <p className="nf__text">
            This code doesn&apos;t match a page in this module set. Check the QR, or head back and
            pick a page to explore.
          </p>
          <Link href="/" className="btn btn--solid" style={{ marginTop: 8 }}>
            Back to scan
          </Link>
        </div>
      </div>
    </main>
  );
}
