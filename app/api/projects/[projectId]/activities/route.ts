import { NextResponse } from "next/server";
import { db } from "@/lib/sqlite";
import { getProjectById } from "@/lib/projectsStore";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  ctx: RouteContext<"/api/projects/[projectId]/activities">
) {
  const { projectId } = await ctx.params;

  const project = getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const latestBatch = db
    .prepare(
      `SELECT id, createdAt, activities FROM project_estimate_batches
       WHERE projectId = ?
       ORDER BY datetime(createdAt) DESC
       LIMIT 1`
    )
    .get(projectId) as { id: string; createdAt: string, activities: string } | undefined;

  if (!latestBatch) {
    return NextResponse.json({ projectId, batchId: null, activities: [] });
  }

  return NextResponse.json({
    projectId,
    batchId: latestBatch.id,
    createdAt: latestBatch.createdAt,
    activities: JSON.parse(latestBatch.activities),
  });
}
