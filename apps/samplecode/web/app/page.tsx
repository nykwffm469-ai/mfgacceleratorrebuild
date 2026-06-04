import Link from "next/link";
import { ExperienceNav } from "../components/ExperienceNav";

const experienceCards = [
  {
    title: "Supplier Overview",
    description: "Portfolio view of supplier status, risk, capability and readiness.",
    href: "/supplier-overview"
  },
  {
    title: "Risk Workbench",
    description: "Operational triage surface for risk signals and action ownership.",
    href: "/risk-workbench"
  },
  {
    title: "Qualification Checklist",
    description: "Gate-based qualification workflow with pending item tracking.",
    href: "/qualification-checklist"
  },
  {
    title: "Onboarding Timeline",
    description: "Chronological activation history from intake to first order.",
    href: "/onboarding-timeline"
  }
];

export default function Page() {
  return (
    <main>
      <h1>Manufacturing Accelerator Copilot</h1>
      <p>
        A 2026-ready manufacturing accelerator experience rebuilt from the 2020
        structure with modern UI and AI-ready workflows.
      </p>
      <ExperienceNav />

      <section className="grid section-spacer">
        {experienceCards.map((card) => (
          <article key={card.title} className="card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <Link className="pill-link" href={card.href}>
              Open experience
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
