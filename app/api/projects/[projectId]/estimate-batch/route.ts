import { NextResponse } from "next/server";
import { saveEstimateBatch } from "@/lib/carbonStore";
import { getProjectById } from "@/lib/projectsStore";
import { s } from "framer-motion/client";
import { ActivityBI } from "@/lib/types/carbon-emission";
export const runtime = "nodejs";
export async function POST(request: Request, ctx: RouteContext<"/api/projects/[projectId]/estimate-batch">) {
  const { projectId } = await ctx.params;
  const project = getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const estimateBatchUrl = new URL(
    `${process.env.CLIMATIQ_BASE_URL as string}estimate/batch`
  );
  try {
    const { activities, dataVersion }: { activities: ActivityBI[], dataVersion: string } = await request.json();
    const estimatesPayload = activities.map((a: ActivityBI, index: number) => {
      let parameters: Record<string, string | number> = {};
      Object.keys(a.unit).forEach((key) => {
        const [mainKey, subKey] = key.split("_");
        if (subKey) {
          parameters[mainKey] = Number(a.unitValue);
          parameters[key] = a.unit[key];
        } else {
          parameters[key] = Number(a.unitValue);
        }
      });
      const estimate = {
        "emission_factor": {
          "activity_id": a.activity,
          "data_version": dataVersion,
          "region": a.region
        },
        parameters
      }
      activities[index].estimatePayload = estimate;
      return estimate;
    });
    const estimateBatchRes = await fetch(estimateBatchUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
      },
      body: JSON.stringify(estimatesPayload),
      cache: "no-store",
    });

    if (!estimateBatchRes.ok) {
      const errorBody = await estimateBatchRes.text();
      return NextResponse.json(
        { error: "Failed to fetch from Climatiq", details: errorBody },
        { status: estimateBatchRes.status }
      );
    }
    const estimateBatchData = await estimateBatchRes.json();
    const { batchId, activities: updatedActivities } = saveEstimateBatch({
      projectId,
      activities: activities.map((a: ActivityBI, index: number) => ({
        ...a,
        estimateResult: estimateBatchData.results[index],
      })),
    });

    return NextResponse.json({
      ...estimateBatchData,
      meta: { projectId, batchId, activities: updatedActivities },
    });
  } catch (err) {
    console.error("Climatiq estimate batch error:", err);
    return NextResponse.json(
      { error: "Unexpected error while talking to Climatiq" },
      { status: 500 }
    );
  }
}
