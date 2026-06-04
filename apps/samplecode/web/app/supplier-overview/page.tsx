import { ExperienceNav } from "../../components/ExperienceNav";
import { suppliers } from "../../lib/mockData";

export default function SupplierOverviewPage() {
  return (
    <main>
      <h1>Supplier Overview</h1>
      <p>Experience 1 of 4. Portfolio-level visibility across supplier health and readiness.</p>
      <ExperienceNav />

      <section className="grid section-spacer">
        {suppliers.map((supplier) => (
          <article className="card" key={supplier.supplierId}>
            <h3>{supplier.legalName}</h3>
            <p>{supplier.supplierId} | Region: {supplier.region}</p>
            <p>Status: <strong>{supplier.status}</strong></p>
            <p>Risk score: {supplier.riskScore}</p>
            <p>Capabilities: {supplier.capabilities.join(", ")}</p>
            <p>Open actions: {supplier.openActions}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
