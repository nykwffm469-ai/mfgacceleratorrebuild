import { ExperienceNav } from "../../components/ExperienceNav";
import { qualificationChecklist } from "../../lib/mockData";

export default function QualificationChecklistPage() {
  return (
    <main>
      <h1>Qualification Checklist</h1>
      <p>Experience 3 of 4. Track mandatory gates before supplier activation.</p>
      <ExperienceNav />

      <section className="section-spacer">
        {qualificationChecklist.map((item) => (
          <article className="card checklist-item" key={item.area}>
            <div>
              <h3>{item.area}</h3>
              <p>{item.notes}</p>
            </div>
            <span className={`status-badge ${item.done ? "status-done" : "status-pending"}`}>
              {item.done ? "Done" : "Pending"}
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}
