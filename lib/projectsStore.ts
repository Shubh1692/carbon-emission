import { Project } from "./types/project";

type ProjectsMemory = { map: Map<string, Project> };

declare global {
  var __projectsMemory: ProjectsMemory | undefined;
}

function store(): ProjectsMemory {
  if (!globalThis.__projectsMemory) {
    globalThis.__projectsMemory = { map: new Map() };
  }
  return globalThis.__projectsMemory;
}

export function listProjects(): Project[] {
  const s = store();
  const rows = Array.from(s.map.values());

  rows.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return rows;
}

export function getProjectById(id: string): Project | null {
  return store().map.get(id) ?? null;
}

export function createProject(input: { name: string; description?: string }): Project {
  const now = new Date().toISOString();

  const p: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    createdAt: now,
    updatedAt: now,
  };

  store().map.set(p.id, p);
  return p;
}

export function updateProject(
  id: string,
  input: { name?: string; description?: string }
): Project | null {
  const s = store();
  const existing = s.map.get(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  const updated: Project = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    description:
      input.description !== undefined
        ? input.description.trim()
        : (existing.description ?? ""),
    updatedAt: now,
  };

  s.map.set(id, updated);
  return updated;
}

export function deleteProject(id: string): boolean {
  return store().map.delete(id);
}

export function deleteAllProjects(): void {
  store().map.clear();
}
