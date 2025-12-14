import { db } from "./sqlite";
import { Project } from "./types/project";

export function listProjects(): Project[] {
  return db
    .prepare<Project[]>(`SELECT * FROM projects ORDER BY datetime(updatedAt) DESC`)
    .all() as unknown as Project[];
}

export function getProjectById(id: string): Project | null {
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id);
  return (row as Project) ?? null;
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

  db.prepare(
    `INSERT INTO projects (id, name, description, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`
  ).run(p.id, p.name, p.description ?? "", p.createdAt, p.updatedAt);

  return p;
}

export function updateProject(
  id: string,
  input: { name?: string; description?: string }
): Project | null {
  const existing = getProjectById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = input.name !== undefined ? input.name.trim() : existing.name;
  const description =
    input.description !== undefined ? input.description.trim() : existing.description ?? "";

  db.prepare(
    `UPDATE projects
     SET name = ?, description = ?, updatedAt = ?
     WHERE id = ?`
  ).run(name, description, now, id);

  return getProjectById(id);
}

export function deleteProject(id: string): boolean {
  const info = db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
  return info.changes > 0;
}
