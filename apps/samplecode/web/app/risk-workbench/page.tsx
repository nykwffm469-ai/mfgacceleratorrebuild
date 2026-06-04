import { ExperienceNav } from "../../components/ExperienceNav";
import { riskSignals } from "../../lib/mockData";

export default function RiskWorkbenchPage() {
  return (
    <main>
      <h1>Risk Workbench</h1>
      <p>Experience 2 of 4. Prioritize supplier risk events with triage ownership.</p>
      <ExperienceNav />

      <section className="grid section-spacer">
        {riskSignals.map((signal) => (
          <article className="card" key={signal.title}>
            <div className="risk-header">
              <h3>{signal.title}</h3>
              <span className={`risk-chip risk-${signal.level}`}>{signal.level}</span>
            </div>
            <p>{signal.summary}</p>
            <p>Owner: {signal.owner}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
