import type { Question } from "@/lib/types";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

/**
 * Diagram crops for a question. When there's one crop per MCQ option
 * (graph-choice questions), each crop is labelled with its option letter.
 */
export default function QuestionFigures({ question }: { question: Question }) {
  const images = question.figureImages;
  if (!images?.length) return null;
  const labelled = question.options?.length === images.length;

  return (
    <div className="qfigs" data-count={images.length}>
      {images.map((src, i) => (
        <figure className="qfig" key={src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="qfig__img"
            src={src}
            alt={question.figure ?? `Diagram for ${question.code}`}
            loading="lazy"
          />
          {labelled && <figcaption className="qfig__cap">{OPTION_KEYS[i]}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
