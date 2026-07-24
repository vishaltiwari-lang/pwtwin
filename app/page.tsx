export default function Home() {
  return (
    <main className="desk">
      <div className="device" style={{ padding: 24 }}>
        <p className="eyebrow">PW Twin</p>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>
          Scan the page, meet its <span className="mark">twin</span>.
        </h1>
        <p className="read" style={{ marginTop: 12, color: "var(--ink-60)" }}>
          Scaffold is live. Building the companion next.
        </p>
      </div>
    </main>
  );
}
