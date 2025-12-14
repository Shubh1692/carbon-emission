import { NextResponse } from "next/server";
import { deleteProject, getProjectById, updateProject } from "@/lib/projectsStore";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: RouteContext<"/api/projects/[projectId]">) {
  const { projectId } = await ctx.params;

  const exists = getProjectById(projectId);
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { name?: string; description?: string };

  if (body.name !== undefined && body.name.trim().length < 2) {
    return NextResponse.json(
      { error: "Project name must be at least 2 characters." },
      { status: 400 }
    );
  }

  const project = updateProject(projectId, body);
  return NextResponse.json({ project });
}

export async function DELETE(_: Request, ctx: RouteContext<"/api/projects/[projectId]">) {
  const { projectId } = await ctx.params;

  const ok = deleteProject(projectId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
