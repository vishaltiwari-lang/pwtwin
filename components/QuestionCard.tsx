"use client";

import type { Question } from "@/lib/types";
import MathText from "./MathText";
import QuestionFigures from "./QuestionFigures";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

export default function QuestionCard({
  question,
  onSolve,
  onAsk,
}: {
  question: Question;
  onSolve: (q: Question) => void;
  onAsk: (q: Question) => void;
}) {
  return (
    <article className="card qcard">
      <div className="qcard__row">
        <span className="qcard__code">{question.code}</span>
        <span className="difficulty" data-level={question.difficulty}>
          {question.difficulty}
        </span>
      </div>

      <p className="qcard__prompt"><MathText text={question.prompt} /></p>

      <QuestionFigures question={question} />

      {question.tags.length > 0 && (
        <ul className="qcard__topics" aria-label="Topics">
          {question.tags.map((t) => (
            <li className="topicChip" key={t}>
              {t}
            </li>
          ))}
        </ul>
      )}

      {question.options && (
        <ul className="qcard__options">
          {question.options.map((opt, i) => (
            <li className="qopt" key={i} data-correct="false">
              <span className="qopt__key">{OPTION_KEYS[i]}</span>
              <span><MathText text={opt} /></span>
            </li>
          ))}
        </ul>
      )}

      <div className="qcard__actions">
        <button className="btn btn--solid" onClick={() => onSolve(question)}>
          Solve step-by-step →
        </button>
        <button className="btn btn--accent" onClick={() => onAsk(question)}>
          Ask why →
        </button>
      </div>
    </article>
  );
}
