"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import MathText from "./MathText";
import MindMap from "./MindMap";
import QuestionFigures from "./QuestionFigures";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

/**
 * Mentor-style guided solution: steps unlock one at a time, the answer only
 * after every step is revealed. Fully offline — driven by the question's
 * seeded steps/why. "I'm stuck" hands the current step to the doubt chat.
 */
export default function Walkthrough({
  question,
  onClose,
  onAskStep,
}: {
  question: Question;
  onClose: () => void;
  onAskStep: (q: Question, stepIndex: number | null) => void;
}) {
  const total = question.steps.length;
  // Number of steps visible; total + 1 means the answer is revealed too.
  const [revealed, setRevealed] = useState(1);
  const answerRevealed = revealed > total;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest reveal in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed]);

  return (
    <>
      <div className="scrim scrim--walk" onClick={onClose} />
      <div className="walk" role="dialog" aria-label={`Step-by-step walkthrough of ${question.code}`}>
        <div className="walk__head">
          <span className="walk__title">
            Walkthrough
            <span className="walk__scope">
              {answerRevealed ? "Solved!" : `Step ${Math.min(revealed, total)} of ${total}`}
            </span>
          </span>
          <button className="dock__close" aria-label="Close walkthrough" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="walk__scroll" ref={scrollRef}>
          <div className="walk__question">
            <div className="qcard__row">
              <span className="qcard__code">{question.code}</span>
              <span className="difficulty" data-level={question.difficulty}>
                {question.difficulty}
              </span>
            </div>
            <p className="qcard__prompt"><MathText text={question.prompt} /></p>
            <QuestionFigures question={question} />
            {question.options && (
              <ul className="qcard__options">
                {question.options.map((opt, i) => (
                  <li
                    className="qopt"
                    key={i}
                    data-correct={answerRevealed && opt === question.answer ? "true" : "false"}
                  >
                    <span className="qopt__key">{OPTION_KEYS[i]}</span>
                    <span><MathText text={opt} /></span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="walk__mentor read">
            Let&apos;s solve this together, one step at a time. Read each step, try to work it
            out yourself, then unlock the next.
          </p>

          <ol className="steps">
            {question.steps.map((step, i) =>
              i < revealed ? (
                <li className="step" key={i}>
                  <span className="step__n" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="step__body">
                    <span className="step__label">{step.label}. </span>
                    <span className="step__detail"><MathText text={step.detail} /></span>
                  </span>
                </li>
              ) : (
                <li className="step step--locked" key={i}>
                  <span className="step__n" aria-hidden>
                    🔒
                  </span>
                  <span className="step__body">Step {i + 1} — unlock the step above first</span>
                </li>
              ),
            )}
          </ol>

          {answerRevealed && (
            <div className="solution walk__answer">
              <p className="solution__answer">
                Answer: <b><MathText text={question.answer} /></b>
              </p>
              <p className="solution__why read"><MathText text={question.why} /></p>
              <MindMap question={question} />
            </div>
          )}
        </div>

        <div className="walk__foot">
          <button
            className="btn btn--ghost"
            onClick={() => onAskStep(question, answerRevealed ? null : Math.min(revealed, total) - 1)}
          >
            I&apos;m stuck 💬
          </button>
          {answerRevealed ? (
            <button className="btn btn--solid" onClick={onClose}>
              Done ✓
            </button>
          ) : (
            <button className="btn btn--solid" onClick={() => setRevealed((r) => r + 1)}>
              {revealed < total ? "Got it — next →" : "Reveal answer"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
