import CarbonCalculatorPanel from "@/components/carbon/CarbonCalculatorPanel";
import Loading from "@/components/common/loading";
import { UnitByType } from "@/lib/types/carbon-emission";
import { getBaseUrl } from "@/lib/utils";
import { Suspense } from "react";

async function ProjectCarbonEmissionPage({
  projectId,
}: {
  projectId: string;
}) {
  if (!projectId) {
    return <div className="p-6">Missing project id in route.</div>;
  }
  const origin = await getBaseUrl();
  const [initRes, savedRes, masterRes] = await Promise.all([
    fetch(`${origin}/api/init`, { cache: "no-store" }),
    fetch(`${origin}/api/projects/${projectId}/activities`, { cache: "no-store" }),
    fetch(`${origin}/api/activities`, { cache: "no-store" }),
  ]);

  if (!savedRes.ok) {
    return <div className="p-6">Failed to load project activities.</div>;
  }

  if (!masterRes.ok) {
    return <div className="p-6">Failed to load activities list.</div>;
  }

  const [initResponse, savedActivities, masterActivities] = await Promise.all([
    initRes.json(),
    savedRes.json(),
    masterRes.json(),
  ]);
  const dataVersion = initResponse.dataVersion.latest;
  const unitsByType = initResponse.unitTypes.unit_types.reduce((unitsByType: UnitByType, { unit_type, units }: { unit_type: string, units: Record<string, string[]> }) => {
    if (!unitsByType[unit_type]) {
      unitsByType[unit_type] = {
        units: Object.keys(units).map((unitName: string) => ({
          name: unitName,
          values: units[unitName].map((value) => ({
            label: value,
            value,
          })),
        })),
      }
    }
    return unitsByType;
  }, {});
  return (
    <CarbonCalculatorPanel
      projectId={projectId}
      initialActivities={savedActivities.activities ?? []}
      masterActivities={masterActivities ?? []}
      unitsByType={unitsByType}
      dataVersion={dataVersion}
      batchId={savedActivities.batchId}
    />
  );
}



export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await params;

  if (!projectId) return <div className="p-6">Missing route params.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<Loading />}>
        <ProjectCarbonEmissionPage projectId={projectId} />
      </Suspense>
    </div>
  );
}
