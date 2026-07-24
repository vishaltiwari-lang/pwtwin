import type { Question } from "@/lib/types";

export default function StepwiseSolution({ question }: { question: Question }) {
  return (
    <div className="solution">
      <p className="solution__answer">
        Answer: <b>{question.answer}</b>
      </p>
      <p className="solution__why read">{question.why}</p>
      <ol className="steps">
        {question.steps.map((step, i) => (
          <li className="step" key={i}>
            <span className="step__n" aria-hidden>
              {i + 1}
            </span>
            <span className="step__body">
              <span className="step__label">{step.label}. </span>
              <span className="step__detail">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
