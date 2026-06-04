const supplierSignals = [
  "Financial instability trend",
  "Regulatory certification mismatch",
  "On-time delivery variance",
  "Quality incident velocity"
];

export default function Page() {
  return (
    <main>
      <h1>Manufacturing Accelerator Copilot</h1>
      <p>
        A 2026-ready supplier qualification and onboarding workspace rebuilt from
        the 2020 accelerator structure.
      </p>

      <section className="grid section-spacer">
        {supplierSignals.map((signal) => (
          <article key={signal} className="card">
            <h3>{signal}</h3>
            <p>
              Agent pipeline scores this signal continuously and recommends next
              actions to procurement teams.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
