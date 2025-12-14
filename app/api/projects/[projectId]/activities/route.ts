import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/projectsStore";
import { getLatestEstimateBatch } from "@/lib/carbonStore";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  ctx: RouteContext<"/api/projects/[projectId]/activities">
) {
  const { projectId } = await ctx.params;

  const project = getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const latestBatch = getLatestEstimateBatch(projectId);

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
