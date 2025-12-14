"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import "react-datepicker/dist/react-datepicker.css";

import {
  ActivityBI,
  ActivityOptionI,
  CarbonActivityI,
  CarbonFormI,
  FilterOptionsI,
  SelectedOption,
  UnitByType,
} from "@/lib/types/carbon-emission";

import CarbonAnalyticsPage from "@/components/carbon/CarbonAnalyticsPage";
import Select from "react-select";
import type { StylesConfig, GroupBase, SingleValue } from "react-select";
import type { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";

type CarbonFormProps = {
  filterActivities: ActivityOptionI[];
  filterOptions: FilterOptionsI;
  projectId: string;
  initialActivities: ActivityBI[];
  dataVersion: string;
  unitsByType: UnitByType;
  batchId: string | null;
};

type Option = SelectedOption;
type IsMulti = false;
type Group = GroupBase<Option>;

const labelCls =
  "block text-sm font-semibold mb-1 capitalize text-gray-700 dark:text-slate-200";

const inputCls =
  "w-full h-11 px-4 rounded-xl border bg-white text-gray-900 " +
  "border-gray-200 placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700 disabled:opacity-60 " +
  "dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-400 " +
  "dark:focus:ring-white/10 dark:focus:border-teal-500";

function pickValue(opt: SelectedOption | string | number | null) {
  if (!opt) return null;
  if (typeof opt === "string" || typeof opt === "number") return opt;
  return opt.value ?? null;
}

function serializeActivity(a: CarbonActivityI) {
  return {
    activity: pickValue(a.activity),
    region: pickValue(a.region),
    source: pickValue(a.source),
    unitType: pickValue(a.unitType),
    unit: a.unit
      ? Object.entries(a.unit).reduce((acc, [key, val]) => {
          if (val) acc[key] = pickValue(val as unknown as SelectedOption) as string;
          return acc;
        }, {} as Record<string, string>)
      : null,
    unitValue: a.unitValue,
    date: a.date ? new Date(a.date).toISOString() : null,
  };
}

const defaultCarbonActivity: CarbonActivityI = {
  region: null,
  source: { label: "EXIOBASE", value: "EXIOBASE" },
  unitType: { label: "Money", value: "Money" },
  unit: null,
  activity: null,
  date: new Date(),
  unitValue: null,
  estimatePayload: null,
  estimateResult: null,
};

function makeSelectStyles(isDark: boolean): StylesConfig<Option, IsMulti, Group> {
  const border = isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const borderHover = isDark ? "rgba(255,255,255,0.18)" : "#d1d5db";
  const bg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const menuBg = isDark ? "#0b1220" : "#fff";
  const text = isDark ? "#e5e7eb" : "#111827";
  const muted = isDark ? "#94a3b8" : "#9ca3af";
  const focus = "#0f766e";

  return {
    control: (base, state): CSSObjectWithLabel => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      borderColor: state.isFocused ? focus : border,
      boxShadow: state.isFocused ? "0 0 0 3px rgba(15, 118, 110, 0.20)" : "none",
      ":hover": { borderColor: state.isFocused ? focus : borderHover },
      backgroundColor: bg,
      opacity: state.isDisabled ? 0.6 : 1,
    }),
    valueContainer: (base): CSSObjectWithLabel => ({ ...base, padding: "0 12px" }),
    input: (base): CSSObjectWithLabel => ({ ...base, margin: 0, padding: 0, color: text }),
    placeholder: (base): CSSObjectWithLabel => ({ ...base, color: muted }),
    singleValue: (base): CSSObjectWithLabel => ({
      ...base,
      color: text,
      textTransform: "uppercase",
    }),
    menu: (base): CSSObjectWithLabel => ({
      ...base,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: menuBg,
      border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
    }),
    option: (base, state): CSSObjectWithLabel => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(15, 118, 110, 0.18)"
        : state.isFocused
        ? "rgba(15, 118, 110, 0.12)"
        : "transparent",
      color: text,
      cursor: "pointer",
      textTransform: "uppercase",
    }),
  };
}

export default function CarbonForm({
  filterOptions,
  filterActivities,
  projectId,
  initialActivities,
  dataVersion,
  unitsByType,
  batchId,
}: CarbonFormProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const selectStyles = useMemo(() => makeSelectStyles(isDark), [isDark]);

  const swalBase = useMemo(
    () => ({
      background: isDark ? "#0b1220" : "#ffffff",
      color: isDark ? "#e5e7eb" : "#111827",
    }),
    [isDark]
  );

  const createEmptyActivity = (): CarbonActivityI => ({
    ...defaultCarbonActivity,
    date: new Date(),
    unit: null,
    activity: null,
    region: null,
    unitValue: null,
    estimatePayload: null,
    estimateResult: null,
  });

  const [carbonForm, setCarbonForm] = useState<CarbonFormI>({
    submittedBatchId: null,
    isUpdating: false,
    activities: [],
  });

  const [activities, setActivities] = useState<ActivityBI[]>([]);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => carbonForm.activities.length > 0 && !loading,
    [carbonForm.activities.length, loading]
  );

  const isDirty = Boolean(carbonForm.submittedBatchId) && carbonForm.isUpdating;

  const estimatedCount = useMemo(() => {
    return (activities || []).filter((a) => a?.estimateResult?.co2e != null).length;
  }, [activities]);

  const addActivityEntry = () => {
    setCarbonForm((entry: CarbonFormI) => ({
      ...entry,
      activities: [...entry.activities, createEmptyActivity()],
      isUpdating: true,
    }));
  };

  const updateActivity = (
    activityIndex: number,
    field: string,
    value: string | number | Date | SelectedOption | null
  ) => {
    if (field.split(".").length > 1) {
      const [mainField, subField] = field.split(".");
      setCarbonForm((prev: CarbonFormI) => {
        const next = [...prev.activities];
        next[activityIndex] = {
          ...next[activityIndex],
          [mainField]: {
            ...(next[activityIndex] as any)[mainField],
            [subField]: value,
          },
        };
        return { ...prev, activities: next, isUpdating: true };
      });
      return;
    }

    setCarbonForm((prev: CarbonFormI) => {
      const next = [...prev.activities];
      next[activityIndex] = { ...next[activityIndex], [field]: value };
      return { ...prev, activities: next, isUpdating: true };
    });
  };

  const validateAll = () => {
    for (const a of carbonForm.activities) {
      if (!pickValue(a.activity)) return "Please select Activity for all entries.";
      if (!pickValue(a.region)) return "Please select Region for all entries.";
      if (!pickValue(a.source)) return "Please select Source for all entries.";
      if (!pickValue(a.unitType)) return "Please select Unit Type for all entries.";
      if (!a.date) return "Please select Date for all entries.";
      const unitNum = typeof a.unitValue === "string" ? Number(a.unitValue) : a.unitValue;
      if (!unitNum || Number.isNaN(unitNum) || unitNum < 1)
        return "Please enter valid Unit Value for all entries.";
    }
    return null;
  };

  const deleteActivityByIndex = (index: number) => {
    setCarbonForm((prev: CarbonFormI) => {
      const next = prev.activities.filter((_, i) => i !== index);
      return {
        ...prev,
        activities: next.length ? next : [createEmptyActivity()],
        isUpdating: true,
      };
    });

    Swal.fire({
      title: "Deleted!",
      text: "Your activity has been deleted. Please submit again to update estimates.",
      icon: "success",
      ...swalBase,
      confirmButtonColor: "#0f766e",
    });
  };

  const onDelete = async (index: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#ef4444",
      ...swalBase,
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      deleteActivityByIndex(index);
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: e?.message ?? "Delete failed. Something went wrong.",
        ...swalBase,
      });
    } finally {
      setLoading(false);
    }
  };

  const setUpdatedActivities = useCallback(
    (updatedActivities: ActivityBI[], updatedBatchId: string | null) => {
      if (!updatedActivities || updatedActivities.length === 0) {
        const one = [createEmptyActivity()];
        setCarbonForm({ submittedBatchId: null, activities: one, isUpdating: false });
        setActivities([]);
        return;
      }

      const mapped: CarbonActivityI[] = updatedActivities.map((a): CarbonActivityI => {
        const unit =
          a.unit
            ? Object.entries(a.unit).reduce((acc, [key, val]) => {
                if (val == null) return acc;
                acc[key] = { label: String(val), value: String(val) };
                return acc;
              }, {} as Record<string, SelectedOption>)
            : null;

        return {
          activity:
            filterActivities.find((act) => act.value === a.activity) ??
            createEmptyActivity().activity,
          region:
            filterOptions.region.find((opt) => opt.value === a.region) ??
            createEmptyActivity().region,
          source:
            filterOptions.source.find((opt) => opt.value === a.source) ??
            createEmptyActivity().source,
          unitType:
            filterOptions.unitType.find((opt) => opt.value === a.unitType) ??
            createEmptyActivity().unitType,
          unit,
          unitValue: a.unitValue ?? 0,
          date: a.date ? new Date(a.date) : new Date(),
          estimateResult: a.estimateResult ?? null,
          estimatePayload: a.estimatePayload ?? null,
        };
      });

      setCarbonForm({ activities: mapped, submittedBatchId: updatedBatchId, isUpdating: false });
      setActivities(updatedActivities);
    },
    [filterActivities, filterOptions]
  );

  const onSubmitAll = async () => {
    const err = validateAll();
    if (err) {
      Swal.fire({ icon: "error", title: "Oops...", text: err, ...swalBase });
      return;
    }

    setLoading(true);
    try {
      const payload = { activities: carbonForm.activities.map(serializeActivity), dataVersion };

      const res = await fetch(`/api/projects/${projectId}/estimate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt ?? "estimate-batch failed");
      }

      const data = await res.json();
      setUpdatedActivities(data.meta.activities, data.meta.batchId);

      Swal.fire({ title: "Success", text: "Estimate Successfully!", icon: "success", ...swalBase, confirmButtonColor: "#0f766e" });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: e?.message ?? "Estimate Failed. Something went wrong.",
        ...swalBase,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRevertChanges = async () => {
    const result = await Swal.fire({
      title: "Discard unsaved changes?",
      text: "This will revert your form to the last submitted estimate.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, revert",
      cancelButtonText: "Keep editing",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      ...swalBase,
    });
    if (!result.isConfirmed) return;

    setUpdatedActivities(activities, carbonForm.submittedBatchId || batchId);

    Swal.fire({
      title: "Reverted",
      text: "Your unsaved changes were discarded.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      ...swalBase,
    });
  };

  useEffect(() => {
    setUpdatedActivities(initialActivities, batchId);
  }, [initialActivities, batchId, setUpdatedActivities]);

  const goBuyCredits = () => {
    if (!carbonForm.submittedBatchId) return;
    router.push("/credits"); // ✅ keep consistent with your global nav
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Carbon Emission Entries
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">
            Add activities, then submit once to estimate emissions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl
                       border border-gray-200 bg-white text-gray-800 font-semibold shadow-sm
                       hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                       dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
          >
            ← Back
          </button>

          <button
            onClick={addActivityEntry}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl
                       bg-teal-700 text-white font-semibold shadow-sm
                       hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200
                       dark:focus:ring-teal-900/40"
          >
            + Add Activity
          </button>

          <button
            onClick={onSubmitAll}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl
                       bg-blue-600 text-white font-semibold shadow-sm
                       hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-4 focus:ring-blue-200
                       dark:focus:ring-blue-900/40"
          >
            {loading ? "Submitting..." : isDirty ? "Submit Again" : "Save & Estimate All"}
          </button>

          <button
            onClick={onRevertChanges}
            disabled={!isDirty || loading}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl
                       border border-amber-200 bg-amber-50 text-amber-900 font-semibold shadow-sm
                       hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-4 focus:ring-amber-200
                       dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15 dark:focus:ring-amber-900/30"
          >
            Revert Changes
          </button>

          <button
            onClick={goBuyCredits}
            disabled={!carbonForm.submittedBatchId || estimatedCount === 0 || isDirty || loading}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl
                       bg-slate-900 text-white font-semibold shadow-sm
                       hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-4 focus:ring-gray-300
                       dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 dark:focus:ring-white/20"
          >
            Buy Credits
          </button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: forms */}
        <div className="lg:col-span-2 space-y-4">
          {carbonForm.activities.map((form: CarbonActivityI, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden
                         dark:border-white/10 dark:bg-white/5"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50
                              dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full
                                   bg-teal-100 text-teal-800 text-sm font-bold
                                   dark:bg-teal-500/15 dark:text-teal-200">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Activity Entry</p>
                    <p className="text-xs text-gray-500 dark:text-slate-300">Fill details before submitting</p>
                  </div>
                </div>

                <button
                  onClick={() => onDelete(i)}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-xl
                             border border-red-200 bg-white text-red-700 font-semibold
                             hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100
                             dark:border-red-500/30 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-500/10 dark:focus:ring-red-900/30"
                >
                  Delete
                </button>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-5">
                {/* Activity */}
                <div>
                  <label className={labelCls}>Activity</label>
                  <Select
                    instanceId={`activity-${i}`}
                    inputId={`activity-${i}`}
                    menuPosition="fixed"
                    styles={selectStyles}
                    options={filterActivities}
                    value={form.activity as unknown as SelectedOption}
                    onChange={(opt: SingleValue<Option>) => updateActivity(i, "activity", opt ?? null)}
                    placeholder="Select activity"
                    isClearable
                  />
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Region</label>
                    <Select
                      instanceId={`region-${i}`}
                      inputId={`region-${i}`}
                      menuPosition="fixed"
                      styles={selectStyles}
                      options={filterOptions.region}
                      value={form.region as unknown as SelectedOption}
                      onChange={(opt: SingleValue<Option>) => updateActivity(i, "region", opt ?? null)}
                      placeholder="Select region"
                      isClearable
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Source</label>
                    <Select
                      instanceId={`source-${i}`}
                      inputId={`source-${i}`}
                      menuPosition="fixed"
                      styles={selectStyles}
                      options={filterOptions.source}
                      value={form.source as unknown as SelectedOption}
                      onChange={(opt: SingleValue<Option>) => updateActivity(i, "source", opt ?? null)}
                      placeholder="Select source"
                      isClearable={false}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Date</label>
                    <DatePicker
                      selected={form.date}
                      onChange={(date) => updateActivity(i, "date", date as Date)}
                      className={inputCls}
                      placeholderText="Select date"
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      popperClassName="tw-datepicker-popper"
                      calendarClassName="tw-datepicker"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Unit Type</label>
                    <Select
                      instanceId={`unit-type-${i}`}
                      inputId={`unit-type-${i}`}
                      menuPosition="fixed"
                      styles={selectStyles}
                      options={filterOptions.unitType}
                      value={form.unitType as unknown as SelectedOption}
                      onChange={(opt: SingleValue<Option>) => updateActivity(i, "unitType", opt ?? null)}
                      placeholder="Select unit type"
                      isClearable={false}
                    />
                  </div>

                  {form.unitType?.value &&
                    unitsByType[form.unitType.value]?.units?.map(({ name, values }) => (
                      <div key={name}>
                        <label className={labelCls}>{name?.split("_")?.join(" ")}</label>
                        <Select
                          instanceId={`unit-${i}-${name}`}
                          inputId={`unit-${i}-${name}`}
                          menuPosition="fixed"
                          styles={selectStyles}
                          options={values}
                          value={form.unit?.[name] as unknown as SelectedOption}
                          onChange={(opt: SingleValue<Option>) =>
                            updateActivity(i, `unit.${name}`, opt ?? null)
                          }
                          placeholder="Select unit"
                          isClearable
                        />
                      </div>
                    ))}

                  <div>
                    <label className={labelCls}>Unit Value</label>
                    <input
                      className={inputCls}
                      value={form.unitValue ?? ""}
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 12.5"
                      onChange={(e) => updateActivity(i, "unitValue", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Graph */}
        <div className="lg:col-span-1">
          <div
            className={[
              "lg:sticky lg:top-6 rounded-2xl border shadow-sm overflow-hidden transition",
              "bg-white border-gray-200 dark:bg-white/5 dark:border-white/10",
              isDirty ? "ring-2 ring-amber-200 border-amber-300 dark:ring-amber-900/30 dark:border-amber-500/30" : "",
              loading ? "opacity-90" : "",
            ].join(" ")}
          >
            <div
              className={[
                "px-5 py-4 border-b",
                "border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5",
                isDirty ? "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Carbon Graph</p>
                  <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">
                    {loading
                      ? "Updating…"
                      : carbonForm.submittedBatchId && activities.length > 0
                      ? isDirty
                        ? "Changes detected — submit to update the graph"
                        : "Based on latest submission"
                      : "Submit to view the graph"}
                  </p>
                </div>

                {isDirty ? (
                  <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-1
                                   dark:bg-amber-500/15 dark:text-amber-200">
                    Needs update
                  </span>
                ) : null}
              </div>
            </div>

            <div className="p-5">
              {carbonForm.submittedBatchId && activities.length > 0 ? (
                <>
                  {isDirty ? (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900
                                    dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                      Your activities changed after the last submission. Click <b>Save & Estimate All</b> to refresh results.
                    </div>
                  ) : null}

                  <CarbonAnalyticsPage activities={activities} />
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-slate-300">
                  No data yet. Click <b>Save & Estimate All</b> to generate results.
                </div>
              )}

              {carbonForm.submittedBatchId && estimatedCount > 0 ? (
                <button
                  onClick={goBuyCredits}
                  disabled={isDirty || loading}
                  className="mt-4 w-full inline-flex items-center justify-center h-11 rounded-xl
                             bg-slate-900 text-white font-semibold shadow-sm
                             hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-4 focus:ring-gray-300
                             dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 dark:focus:ring-white/20"
                >
                  Buy Credits for this estimate
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
