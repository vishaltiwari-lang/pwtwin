import katex from "katex";
import { splitMath } from "@/lib/math";

/**
 * Renders mixed prose + LaTeX text ($…$ inline, $$…$$ display) with KaTeX.
 * Bad LaTeX degrades to red source text instead of throwing (throwOnError: false).
 */
export default function MathText({ text }: { text: string }) {
  return (
    <>
      {splitMath(text).map((seg, i) =>
        seg.type === "text" ? (
          seg.value
        ) : (
          <span
            key={i}
            className={seg.type === "block" ? "math math--block" : "math"}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(seg.value, {
                throwOnError: false,
                displayMode: seg.type === "block",
              }),
            }}
          />
        ),
      )}
    </>
  );
}
