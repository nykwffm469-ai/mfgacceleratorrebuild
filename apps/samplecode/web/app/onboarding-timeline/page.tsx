import { ExperienceNav } from "../../components/ExperienceNav";
import { onboardingTimeline } from "../../lib/mockData";

export default function OnboardingTimelinePage() {
  return (
    <main>
      <h1>Onboarding Timeline</h1>
      <p>Experience 4 of 4. End-to-end event history from intake to activation.</p>
      <ExperienceNav />

      <section className="timeline section-spacer">
        {onboardingTimeline.map((item) => (
          <article className="card timeline-item" key={`${item.date}-${item.event}`}>
            <p className="timeline-date">{item.date}</p>
            <h3>{item.event}</h3>
            <p>Stage: {item.stage}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
