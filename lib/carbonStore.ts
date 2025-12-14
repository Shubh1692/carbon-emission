
import { db } from "@/lib/sqlite";
import { ActivityBI } from "./types/carbon-emission";

export function saveEstimateBatch(params: {
  projectId: string;
  activities: ActivityBI[];
}) {
  const { projectId, activities } = params;

  const now = new Date().toISOString();
  const batchId = crypto.randomUUID();

  const insertBatch = db.prepare(`
    INSERT INTO project_estimate_batches (id, projectId, activities, createdAt)
    VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertBatch.run(
      batchId,
      projectId,
      JSON.stringify(activities),
      now
    );
  });

  tx();

  return { batchId, activities };
}
