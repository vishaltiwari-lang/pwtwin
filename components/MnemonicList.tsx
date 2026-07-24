import type { Mnemonic } from "@/lib/types";

export default function MnemonicList({ mnemonics }: { mnemonics: Mnemonic[] }) {
  return (
    <>
      {mnemonics.map((m, i) => (
        <article className="card mcard" key={i}>
          <p className="mcard__phrase">
            <span className="mark">{m.phrase}</span>
          </p>
          <p className="mcard__expands">{m.expands}</p>
          {m.note && <p className="mcard__note">{m.note}</p>}
        </article>
      ))}
    </>
  );
}
