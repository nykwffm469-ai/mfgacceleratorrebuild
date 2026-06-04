"use client";

import { useEffect, useState } from "react";
import { ExperienceNav } from "../../components/ExperienceNav";
import { fetchChecklist, toggleChecklistItem } from "../../lib/apiClient";
import { ChecklistItem } from "../../lib/mockData";

export default function QualificationChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    fetchChecklist().then(setItems);
  }, []);

  async function onToggle(area: string) {
    const updated = await toggleChecklistItem(area);
    if (!updated) {
      return;
    }

    setItems((current) =>
      current.map((item) => (item.area === area ? updated : item))
    );
  }

  return (
    <main>
      <h1>Qualification Checklist</h1>
      <p>Experience 3 of 4. Track mandatory gates before supplier activation.</p>
      <ExperienceNav />

      <section className="section-spacer">
        {items.map((item) => (
          <article className="card checklist-item" key={item.area}>
            <div>
              <h3>{item.area}</h3>
              <p>{item.notes}</p>
            </div>
            <div className="row-actions">
              <span className={`status-badge ${item.done ? "status-done" : "status-pending"}`}>
                {item.done ? "Done" : "Pending"}
              </span>
              <button className="action-button" type="button" onClick={() => onToggle(item.area)}>
                Toggle
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
