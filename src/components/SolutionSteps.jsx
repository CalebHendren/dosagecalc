import { formatAnswer } from '../lib/format.js';

// Renders the worked solution: the final answer plus the ordered steps that
// lead to it. Wrapped in a region with an accessible heading so screen-reader
// users can jump to it.
export default function SolutionSteps({ problem }) {
  return (
    <section className="solution" aria-labelledby="solution-heading">
      <h2 id="solution-heading">Worked solution</h2>
      <p className="solution-answer">
        Answer: <span className="value">{formatAnswer(problem)}</span>
      </p>
      <ol className="steps">
        {problem.steps.map((step, i) => (
          <li className="step" key={i}>
            <span className="step-num" aria-hidden="true" />
            <div>
              <p className="step-label">
                <span className="visually-hidden">Step {i + 1}: </span>
                {step.label}
              </p>
              <div className="step-expr">{step.expr}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
