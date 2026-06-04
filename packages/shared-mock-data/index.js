export function ensureSeed(namespace, seedFactory) {
  const key = `legacy-demo:${namespace}`;
  const existing = localStorage.getItem(key);

  if (existing) {
    return JSON.parse(existing);
  }

  const seeded = seedFactory();
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function loadSeed(namespace, fallbackFactory) {
  const key = `legacy-demo:${namespace}`;
  const raw = localStorage.getItem(key);
  if (!raw) {
    return ensureSeed(namespace, fallbackFactory);
  }
  return JSON.parse(raw);
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
