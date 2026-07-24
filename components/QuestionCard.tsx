"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import StepwiseSolution from "./StepwiseSolution";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

export default function QuestionCard({
  question,
  onAsk,
}: {
  question: Question;
  onAsk: (q: Question) => void;
}) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <article className="card qcard">
      <div className="qcard__row">
        <span className="qcard__code">{question.code}</span>
        <span className="difficulty" data-level={question.difficulty}>
          {question.difficulty}
        </span>
      </div>

      <p className="qcard__prompt">{question.prompt}</p>

      {question.options && (
        <ul className="qcard__options">
          {question.options.map((opt, i) => (
            <li
              className="qopt"
              key={i}
              data-correct={showSolution && opt === question.answer ? "true" : "false"}
            >
              <span className="qopt__key">{OPTION_KEYS[i]}</span>
              {opt}
            </li>
          ))}
        </ul>
      )}

      <div className="qcard__actions">
        <button
          className="btn btn--ghost"
          onClick={() => setShowSolution((v) => !v)}
          aria-expanded={showSolution}
        >
          {showSolution ? "Hide solution" : "Show solution"}
        </button>
        <button className="btn btn--accent" onClick={() => onAsk(question)}>
          Ask why →
        </button>
      </div>

      {showSolution && <StepwiseSolution question={question} />}
    </article>
  );
}
