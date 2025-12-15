import { Suspense } from "react";
import CarbonProjectDetails from "@/components/carbon/CarbonProjectDetails";
import { getBaseUrl } from "@/lib/utils";
import Loading from "@/components/common/loading";

async function ProjectDetails({ carbonKey }: { carbonKey: string }) {
  const projectRes = await fetch(
    `${await getBaseUrl()}/api/carbon-projects/${encodeURIComponent(carbonKey)}`,
    { cache: "no-store" }
  );

  if (!projectRes.ok) {
    return <div className="p-6">Failed to load project detail.</div>;
  }

  const project = await projectRes.json();
  return <CarbonProjectDetails project={project} />;
}

export default async function ProjectCarbonDetailPage({
  params,
}: {
  params: { carbonKey: string };
}) {
  const { carbonKey } = await params;

  if (!carbonKey) return <div className="p-6">Missing route params.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<Loading />}>
        <ProjectDetails carbonKey={carbonKey} />
      </Suspense>
    </div>
  );
}
