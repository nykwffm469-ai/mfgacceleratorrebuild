"use client";

import { useEffect, useState } from "react";
import { ExperienceNav } from "../../components/ExperienceNav";
import { addTimelineCheckpoint, fetchTimeline } from "../../lib/apiClient";
import { TimelineItem } from "../../lib/mockData";

export default function OnboardingTimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    fetchTimeline().then(setItems);
  }, []);

  async function onAddCheckpoint() {
    const updated = await addTimelineCheckpoint("Executive onboarding review", "Governance");
    if (!updated) {
      return;
    }

    setItems((current) => [updated, ...current]);
  }

  return (
    <main>
      <h1>Onboarding Timeline</h1>
      <p>Experience 4 of 4. End-to-end event history from intake to activation.</p>
      <ExperienceNav />
      <button className="action-button section-spacer" type="button" onClick={onAddCheckpoint}>
        Add governance checkpoint
      </button>

      <section className="timeline section-spacer">
        {items.map((item) => (
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
