import { ActivityBI } from "./types/carbon-emission";

type EstimateBatch = {
  id: string;
  projectId: string;
  activities: ActivityBI[];
  createdAt: string;
};

type CarbonMemory = { batches: Map<string, EstimateBatch> };

declare global {
  var __carbonMemory: CarbonMemory | undefined;
}

function store(): CarbonMemory {
  if (!globalThis.__carbonMemory) {
    globalThis.__carbonMemory = { batches: new Map() };
  }
  return globalThis.__carbonMemory;
}

export function saveEstimateBatch(params: { projectId: string; activities: ActivityBI[] }) {
  const { projectId, activities } = params;

  const now = new Date().toISOString();
  const batchId = crypto.randomUUID();

  const batch: EstimateBatch = {
    id: batchId,
    projectId,
    activities,
    createdAt: now,
  };

  store().batches.set(batchId, batch);

  return { batchId, activities };
}

export function listEstimateBatches(projectId?: string): EstimateBatch[] {
  const rows = Array.from(store().batches.values());
  const filtered = projectId ? rows.filter((b) => b.projectId === projectId) : rows;

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return filtered;
}

export function getEstimateBatchById(batchId: string): EstimateBatch | null {
  return store().batches.get(batchId) ?? null;
}

export function deleteEstimateBatch(batchId: string): boolean {
  return store().batches.delete(batchId);
}

export function deleteAllEstimateBatches(): void {
  store().batches.clear();
}

export function getLatestEstimateBatch(projectId: string):
  | { id: string; createdAt: string; activities: string }
  | undefined {
  const rows = Array.from(store().batches.values())
    .filter((b) => b.projectId === projectId);

  if (rows.length === 0) return undefined;

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latest = rows[0];

  return {
    id: latest.id,
    createdAt: latest.createdAt,
    activities: JSON.stringify(latest.activities),
  };
}
