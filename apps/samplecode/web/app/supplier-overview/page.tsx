"use client";

import { useEffect, useState } from "react";
import { ExperienceNav } from "../../components/ExperienceNav";
import { fetchSuppliers, resolveSupplierAction } from "../../lib/apiClient";
import { SupplierSnapshot } from "../../lib/mockData";

export default function SupplierOverviewPage() {
  const [rows, setRows] = useState<SupplierSnapshot[]>([]);

  useEffect(() => {
    fetchSuppliers().then(setRows);
  }, []);

  async function onResolveAction(supplierId: string) {
    const updated = await resolveSupplierAction(supplierId);
    if (!updated) {
      return;
    }

    setRows((current) =>
      current.map((supplier) =>
        supplier.supplierId === supplierId ? updated : supplier
      )
    );
  }

  return (
    <main>
      <h1>Supplier Overview</h1>
      <p>Experience 1 of 4. Portfolio-level visibility across supplier health and readiness.</p>
      <ExperienceNav />

      <section className="grid section-spacer">
        {rows.map((supplier) => (
          <article className="card" key={supplier.supplierId}>
            <h3>{supplier.legalName}</h3>
            <p>{supplier.supplierId} | Region: {supplier.region}</p>
            <p>Status: <strong>{supplier.status}</strong></p>
            <p>Risk score: {supplier.riskScore}</p>
            <p>Capabilities: {supplier.capabilities.join(", ")}</p>
            <p>Open actions: {supplier.openActions}</p>
            <button
              className="action-button"
              type="button"
              onClick={() => onResolveAction(supplier.supplierId)}
              disabled={supplier.openActions === 0}
            >
              Resolve one action
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
