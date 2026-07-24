import type { Shorthand as ShorthandRow } from "@/lib/types";

export default function Shorthand({ rows }: { rows: ShorthandRow[] }) {
  return (
    <div className="card shList">
      {rows.map((r, i) => (
        <div className="shRow" key={i}>
          <span className="shRow__term">{r.term}</span>
          <span className="shRow__meaning">{r.meaning}</span>
        </div>
      ))}
    </div>
  );
}
