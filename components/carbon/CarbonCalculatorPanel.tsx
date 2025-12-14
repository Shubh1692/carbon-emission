"use client";

import { useCallback, useEffect, useState } from "react";
import CarbonForm from "@/components/carbon/CarbonForm";
import type {
  ActivitySearchOptionI,
  ActivityOptionI,
  FilterOptionsI,
  UnitByType,
  ActivityBI,
} from "@/lib/types/carbon-emission";

export default function CarbonEntries({
  projectId,
  initialActivities,
  masterActivities,
  unitsByType,
  dataVersion,
  batchId,
}: {
  projectId: string;
  initialActivities: ActivityBI[];
  masterActivities: ActivitySearchOptionI[];
  dataVersion: string;
  unitsByType: UnitByType;
  batchId: string | null;
}) {
  const [activities, setActivities] = useState<Record<string, ActivitySearchOptionI[]>>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptionsI>({
    year: [],
    source: [],
    region: [],
    category: [],
    scope: [],
    sector: [],
    unitType: [],
    unit: [],
  });
  const [filterActivities, setFilterActivities] = useState<ActivityOptionI[]>([]);

  const setFilterActivityOptions = useCallback((activitiesData: ActivitySearchOptionI[]) => {
    const groupedActivities: Record<string, ActivitySearchOptionI[]> = {};
    const newFilterOptions: FilterOptionsI = {
      year: [],
      source: [],
      region: [],
      category: [],
      scope: [],
      sector: [],
      unitType: [],
      unit: [],
    };

    const nextFilterActivities: ActivityOptionI[] = [];
    const alreadyAdded = new Set<string>();
    const alreadyAddedSources = new Set<string>();
    const alreadyAddedYears = new Set<string>();
    const alreadyAddedRegions = new Set<string>();
    const alreadyAddedCategories = new Set<string>();
    const alreadyAddedScopes = new Set<string>();
    const alreadyAddedUnitTypes = new Set<string>();

    activitiesData.forEach((activity) => {
      (groupedActivities[activity.activity_id] ??= []).push(activity);

      if (!alreadyAdded.has(activity.activity_id)) {
        alreadyAdded.add(activity.activity_id);
        nextFilterActivities.push({ label: activity.name, value: activity.activity_id });
      }

      if (activity.source && !alreadyAddedSources.has(activity.source)) {
        alreadyAddedSources.add(activity.source);
        newFilterOptions.source.push({ label: activity.source, value: activity.source });
      }

      if (activity.year && !alreadyAddedYears.has(String(activity.year))) {
        alreadyAddedYears.add(String(activity.year));
        newFilterOptions.year.push({ label: String(activity.year), value: activity.year });
      }

      if (activity.region && !alreadyAddedRegions.has(activity.region)) {
        alreadyAddedRegions.add(activity.region);
        newFilterOptions.region.push({ label: activity.region_name, value: activity.region });
      }

      if (activity.category && !alreadyAddedCategories.has(activity.category)) {
        alreadyAddedCategories.add(activity.category);
        newFilterOptions.category.push({ label: activity.category, value: activity.category });
      }

      if (activity.scopes?.length) {
        activity.scopes.forEach((scope) => {
          if (!alreadyAddedScopes.has(scope)) {
            alreadyAddedScopes.add(scope);
            newFilterOptions.scope.push({ label: scope, value: scope });
          }
        });
      }

      if (activity.unit_type && !alreadyAddedUnitTypes.has(activity.unit_type)) {
        alreadyAddedUnitTypes.add(activity.unit_type);
        newFilterOptions.unitType.push({ label: activity.unit_type, value: activity.unit_type });
      }
    });

    setFilterActivities(nextFilterActivities);
    setFilterOptions(newFilterOptions);
    setActivities(groupedActivities);
  }, []);

  useEffect(() => {
    setFilterActivityOptions(masterActivities);
  }, [masterActivities, setFilterActivityOptions]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Carbon Calculator
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
            Add activities and calculate emissions for this project.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <CarbonForm
            filterActivities={filterActivities}
            filterOptions={filterOptions}
            projectId={projectId}
            initialActivities={initialActivities}
            unitsByType={unitsByType}
            dataVersion={dataVersion}
            batchId={batchId}
          />
        </div>
      </div>
    </div>
  );
}
