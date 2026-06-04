"use client";

import { useEffect, useState } from "react";
import { ExperienceNav } from "../../components/ExperienceNav";
import { escalateSignal, fetchRiskSignals } from "../../lib/apiClient";
import { RiskSignal } from "../../lib/mockData";

export default function RiskWorkbenchPage() {
  const [signals, setSignals] = useState<RiskSignal[]>([]);

  useEffect(() => {
    fetchRiskSignals().then(setSignals);
  }, []);

  async function onEscalate(title: string) {
    const updated = await escalateSignal(title);
    if (!updated) {
      return;
    }

    setSignals((current) =>
      current.map((signal) => (signal.title === title ? updated : signal))
    );
  }

  return (
    <main>
      <h1>Risk Workbench</h1>
      <p>Experience 2 of 4. Prioritize supplier risk events with triage ownership.</p>
      <ExperienceNav />

      <section className="grid section-spacer">
        {signals.map((signal) => (
          <article className="card" key={signal.title}>
            <div className="risk-header">
              <h3>{signal.title}</h3>
              <span className={`risk-chip risk-${signal.level}`}>{signal.level}</span>
            </div>
            <p>{signal.summary}</p>
            <p>Owner: {signal.owner}</p>
            <button
              className="action-button"
              type="button"
              onClick={() => onEscalate(signal.title)}
              disabled={signal.level === "critical"}
            >
              Escalate risk
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
