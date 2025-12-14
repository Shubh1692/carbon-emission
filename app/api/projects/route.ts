import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/projectsStore";

export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; description?: string };

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: "Project name is required (min 2 chars)." }, { status: 400 });
  }

  const project = createProject({ name: body.name, description: body.description });
  return NextResponse.json({ project }, { status: 201 });
}
