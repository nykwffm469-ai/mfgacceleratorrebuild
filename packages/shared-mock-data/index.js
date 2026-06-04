const seedRegistry = new Map();

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isEmptyObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0;
}

export function ensureSeed(namespace, seedFactory) {
  if (typeof seedFactory === "function") {
    seedRegistry.set(namespace, seedFactory);
  }

  const key = `legacy-demo:${namespace}`;
  const existing = localStorage.getItem(key);

  if (existing) {
    const parsed = safeParse(existing);
    if (parsed !== null && !isEmptyObject(parsed)) {
      return parsed;
    }
  }

  const factory = seedRegistry.get(namespace) || seedFactory;
  const seeded = (typeof factory === "function" ? factory() : {}) || {};
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function loadSeed(namespace, fallbackFactory) {
  const key = `legacy-demo:${namespace}`;
  const raw = localStorage.getItem(key);
  if (!raw) {
    const factory = seedRegistry.get(namespace) || fallbackFactory;
    return ensureSeed(namespace, factory);
  }
  const parsed = safeParse(raw);
  if (parsed !== null && !isEmptyObject(parsed)) {
    return parsed;
  }

  const factory = seedRegistry.get(namespace) || fallbackFactory;
  return ensureSeed(namespace, factory);
}

export function saveSeed(namespace, value) {
  const key = `legacy-demo:${namespace}`;
  localStorage.setItem(key, JSON.stringify(value));
}

export function makeId(prefix) {
  const key = `legacy-demo:id-seq:${prefix}`;
  const current = Number(localStorage.getItem(key) ?? "1000");
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return `${prefix}-${next}`;
}
