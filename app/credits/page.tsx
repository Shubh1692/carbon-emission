import CarbonCreditPanel from "@/components/carbon/CarbonCreditPanel";
import Loading from "@/components/common/loading";
import { Suspense } from "react";

async function ProjectCarbonCreditPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = await searchParams;
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white-900">
          Carbon Credits Marketplace
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse carbon projects using filters and pagination.
        </p>
      </div>

      <CarbonCreditPanel initialSearchParams={sp} />
    </div>
  );
}



export default function ProjectCarbonCreditsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<Loading />}>
        <ProjectCarbonCreditPage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
