import {
  ChecklistItem,
  RiskSignal,
  SupplierSnapshot,
  TimelineItem,
  onboardingTimeline,
  qualificationChecklist,
  riskSignals,
  suppliers
} from "./mockData";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchSuppliers(): Promise<SupplierSnapshot[]> {
  try {
    return await requestJson<SupplierSnapshot[]>("/experiences/suppliers");
  } catch {
    return suppliers;
  }
}

export async function resolveSupplierAction(supplierId: string): Promise<SupplierSnapshot | null> {
  try {
    return await requestJson<SupplierSnapshot>(`/experiences/suppliers/${encodeURIComponent(supplierId)}/resolve-action`, {
      method: "POST"
    });
  } catch {
    return null;
  }
}

export async function fetchRiskSignals(): Promise<RiskSignal[]> {
  try {
    return await requestJson<RiskSignal[]>("/experiences/risk-signals");
  } catch {
    return riskSignals;
  }
}

export async function escalateSignal(title: string): Promise<RiskSignal | null> {
  try {
    return await requestJson<RiskSignal>(`/experiences/risk-signals/${encodeURIComponent(title)}/escalate`, {
      method: "POST"
    });
  } catch {
    return null;
  }
}

export async function fetchChecklist(): Promise<ChecklistItem[]> {
  try {
    return await requestJson<ChecklistItem[]>("/experiences/qualification-checklist");
  } catch {
    return qualificationChecklist;
  }
}

export async function toggleChecklistItem(area: string): Promise<ChecklistItem | null> {
  try {
    return await requestJson<ChecklistItem>(`/experiences/qualification-checklist/${encodeURIComponent(area)}/toggle`, {
      method: "POST"
    });
  } catch {
    return null;
  }
}

export async function fetchTimeline(): Promise<TimelineItem[]> {
  try {
    return await requestJson<TimelineItem[]>("/experiences/onboarding-timeline");
  } catch {
    return onboardingTimeline;
  }
}

export async function addTimelineCheckpoint(event: string, stage: string): Promise<TimelineItem | null> {
  try {
    return await requestJson<TimelineItem>("/experiences/onboarding-timeline/checkpoint", {
      method: "POST",
      body: JSON.stringify({ event, stage })
    });
  } catch {
    return null;
  }
}
