import CarbonCreditPanel from "@/components/carbon/CarbonCreditPanel";

export default async function ProjectCarbonCreditPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {

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

      <CarbonCreditPanel initialSearchParams={searchParams} />
    </div>
  );
}
