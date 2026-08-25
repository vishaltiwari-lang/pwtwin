import type { Question } from "@/lib/types";
import { buildMindMap } from "@/lib/mindmap";
import MathText from "./MathText";

/**
 * One-glance retention map shown after a walkthrough's answer reveal.
 * Pure HTML/CSS tree (not SVG) so labels can wrap and render LaTeX.
 */
export default function MindMap({ question }: { question: Question }) {
  const map = buildMindMap(question);
  return (
    <section className="mindmap" aria-label={`Mind map for ${question.code}`}>
      <p className="mindmap__title">🧠 Mind map — lock it in</p>
      <div className="mindmap__root">
        <MathText text={map.root} />
      </div>
      <ul className="mindmap__branches">
        {map.branches.map((b) => (
          <li className="mindmap__branch" key={b.label}>
            <span className="mindmap__label">{b.label}</span>
            <ul className="mindmap__leaves">
              {b.children.map((c, i) => (
                <li className="mindmap__leaf" key={i}>
                  <MathText text={b.label === "Solution path" ? `${i + 1}. ${c}` : c} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
