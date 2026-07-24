import type { CheatRow } from "@/lib/types";

export default function CheatSheet({ rows }: { rows: CheatRow[] }) {
  return (
    <div className="card cheat">
      {rows.map((r, i) => (
        <div className="cheatRow" key={i}>
          <span className="cheatRow__name">{r.name}</span>
          <span className="cheatRow__value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
