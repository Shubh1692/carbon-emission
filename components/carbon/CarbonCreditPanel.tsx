"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Select, { CSSObjectWithLabel, GroupBase, SingleValue, StylesConfig } from "react-select";
import { SelectedOption } from "@/lib/types/carbon-emission";


type Option = SelectedOption;
type IsMulti = false;
type Group = GroupBase<Option>;

type Props = {
  initialSearchParams?: Record<string, string | string[] | undefined>;
};

type CarbonProject = {
  key: string;
  projectID?: string;
  name: string;
  registry?: string;
  country?: string;
  region?: string;
  price?: string | number;
  hasSupply?: boolean;
  vintages?: string[];
  sustainableDevelopmentGoals?: string[];
  methodologies?: { id: string; category?: string; name?: string }[];
  stats?: {
    totalSupply?: number;
    totalRetired?: number;
    totalBridged?: number;
    totalListingsSupply?: number;
    totalPoolsSupply?: number;
  };
  url?: string;
  description?: string;
  short_description?: string;
  images?: string[];
  satelliteImage?: { url?: string; caption?: string };
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    sp.set(k, s);
  });
  return sp.toString();
}

const inputBase =
  "w-full h-11 px-4 rounded-xl border bg-white text-gray-900 " +
  "border-gray-200 placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700 " +
  "dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-400 " +
  "dark:focus:ring-white/10 dark:focus:border-teal-500";

const selectBase =
  "w-full h-11 px-3 rounded-xl border bg-white text-gray-900 " +
  "border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700 " +
  "dark:bg-white/5 dark:text-white dark:border-white/10 dark:focus:ring-white/10 dark:focus:border-teal-500";

const labelCls = "text-xs font-semibold text-gray-700 dark:text-slate-200";

function getProjectImage(p: CarbonProject) {
  return p?.satelliteImage?.url || p?.url || p?.images?.[0] || "";
}

function formatPrice(v?: string | number) {
  if (v === null || v === undefined) return "-";
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

type CountryOption = { value: string; label: string };

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


export default function CarbonCreditPanel({ }: Props) {
  const selectStyles = useMemo(() => makeSelectStyles(true), []);
  const router = useRouter();
  const sp = useSearchParams();

  const urlState = useMemo(() => {
    const offset = Number(sp.get("offset") ?? "0") || 0;
    const limit = Number(sp.get("limit") ?? "20") || 20;

    return {
      ids: sp.get("ids") ?? "",
      country: sp.get("country") ?? "",
      category: sp.get("category") ?? "",
      search: sp.get("search") ?? "",
      vintage: sp.get("vintage") ?? "",
      sdg: sp.get("sdg") ?? "",
      registry: sp.get("registry") ?? "",
      minPriceUSD: sp.get("minPriceUSD") ?? "",
      assetPriceSourceIds: sp.get("assetPriceSourceIds") ?? "",
      offset,
      limit,
    };
  }, [sp]);

  const [filters, setFilters] = useState(urlState);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CarbonProject[]>([]);
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Country dropdown options
  const [countries, setCountries] = useState<CountryOption[]>([]);

  useEffect(() => setFilters(urlState), [urlState]);

  const isSameAsUrl = useMemo(
    () => JSON.stringify(filters) === JSON.stringify(urlState),
    [filters, urlState]
  );

  const applyFilters = (next?: Partial<typeof filters>) => {
    const merged = { ...filters, ...(next ?? {}), offset: next?.offset ?? 0 };

    const qs = buildQuery({
      ids: merged.ids,
      country: merged.country,
      category: merged.category,
      search: merged.search,
      vintage: merged.vintage,
      sdg: merged.sdg,
      registry: merged.registry,
      minPriceUSD: merged.minPriceUSD,
      assetPriceSourceIds: merged.assetPriceSourceIds,
      offset: merged.offset,
      limit: merged.limit,
    });

    router.push(`/credits?${qs}`);
  };

  const clearFilters = () => router.push(`/credits?offset=0&limit=20`);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const qs = buildQuery(urlState);
        const res = await fetch(`/api/carbon-projects?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to fetch projects");
        }

        const data = (await res.json()) as {
          items: CarbonProject[];
          itemsCount: number;
          offset: number;
        };

        const nextItems = Array.isArray(data.items) ? data.items : [];
        setItems(nextItems);
        setItemsCount(Number(data.itemsCount ?? 0) || 0);

      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Something went wrong");
        setItems([]);
        setItemsCount(0);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [urlState]);

  // Try to fetch full country list from backend (optional endpoint)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        // Expected response examples:
        // 1) { items: ["IN","US","BR"] }
        // 2) ["IN","US","BR"]
        // 3) { items: [{ code:"IN", name:"India" }] }
        const res = await fetch("/api/carbon-projects/countries", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;

        const countries = await res.json();
        setCountries(countries);
      } catch {
        // ignore (fallback already handled)
      }
    })();

    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil((itemsCount || 0) / urlState.limit));
  const page = Math.min(totalPages, Math.floor(urlState.offset / urlState.limit) + 1);

  const canPrev = urlState.offset > 0;
  const canNext = urlState.offset + urlState.limit < itemsCount;

  const showingFrom = itemsCount === 0 ? 0 : urlState.offset + 1;
  const showingTo = Math.min(urlState.offset + items.length, itemsCount);

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                       hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                       dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
          >
            ← Back
          </button>

          <button
            onClick={clearFilters}
            className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                       hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                       dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-slate-300">
            Page <b className="text-gray-900 dark:text-white">{page}</b> of{" "}
            <b className="text-gray-900 dark:text-white">{totalPages}</b>
          </span>

          <select
            className={selectBase}
            value={filters.limit}
            onChange={(e) => {
              const limit = Number(e.target.value) || 20;
              setFilters((p) => ({ ...p, limit }));
              applyFilters({ limit });
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Left Filters + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* LEFT: Filters */}
        <div className="lg:sticky lg:top-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-white/5">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Filters</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">All query params supported</p>
              </div>

              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
              >
                {showAdvanced ? "Hide" : "More"} ▾
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <div className={labelCls}>Search</div>
                <input
                  className={inputBase}
                  placeholder="Project name / description..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                />
              </div>

              {countries.length && <div>
                <div className={labelCls}>Country</div>
                <Select
                  inputId={`country`}
                  menuPosition="fixed"
                  styles={selectStyles}
                  options={countries}
                  value={filters.country ? { label: filters.country, value: filters.country } as unknown as SelectedOption : null}
                  onChange={(opt: SingleValue<Option>) => setFilters((p) => ({ ...p, country: opt?.label || '' }))}
                  placeholder="Select country"
                  isClearable
                />
                {!countries.length ? (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                    Loading countries… (fallback uses current results)
                  </p>
                ) : null}
              </div>}

              <div>
                <div className={labelCls}>Registry</div>
                <input
                  className={inputBase}
                  placeholder="e.g. VCS / CMARK"
                  value={filters.registry}
                  onChange={(e) => setFilters((p) => ({ ...p, registry: e.target.value }))}
                />
              </div>

              <div>
                <div className={labelCls}>Category</div>
                <input
                  className={inputBase}
                  placeholder="e.g. Forestry"
                  value={filters.category}
                  onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                />
              </div>

              <div>
                <div className={labelCls}>Vintage</div>
                <input
                  className={inputBase}
                  placeholder="e.g. 2020"
                  value={filters.vintage}
                  onChange={(e) => setFilters((p) => ({ ...p, vintage: e.target.value }))}
                />
              </div>

              <div>
                <div className={labelCls}>SDG</div>
                <input
                  className={inputBase}
                  placeholder="e.g. 13"
                  value={filters.sdg}
                  onChange={(e) => setFilters((p) => ({ ...p, sdg: e.target.value }))}
                />
              </div>

              {showAdvanced ? (
                <div className="pt-2 border-t border-gray-100 space-y-3 dark:border-white/10">
                  <div>
                    <div className={labelCls}>IDs (comma separated)</div>
                    <input
                      className={inputBase}
                      placeholder="e.g. VCS-844,VCS-1418"
                      value={filters.ids}
                      onChange={(e) => setFilters((p) => ({ ...p, ids: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className={labelCls}>Asset Price Source IDs</div>
                    <input
                      className={inputBase}
                      placeholder="comma separated"
                      value={filters.assetPriceSourceIds}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, assetPriceSourceIds: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <div className={labelCls}>Min Price USD</div>
                    <input
                      className={inputBase}
                      placeholder="e.g. 2"
                      value={filters.minPriceUSD}
                      onChange={(e) => setFilters((p) => ({ ...p, minPriceUSD: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => applyFilters()}
                disabled={loading || isSameAsUrl}
                className="w-full h-11 px-4 rounded-xl bg-blue-600 text-white font-semibold shadow-sm
                           hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-4 focus:ring-blue-200
                           dark:focus:ring-blue-900/40"
              >
                Apply
              </button>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-white/5">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Projects</p>
              <p className="text-xs text-gray-500 dark:text-slate-300">
                {itemsCount ? `Showing ${showingFrom}–${showingTo} of ${itemsCount}` : "No results"}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-300">
              {loading ? "Loading..." : `Page ${page}/${totalPages}`}
            </p>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(urlState.limit, 12) }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden
                             dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="aspect-[16/9] bg-gray-100 dark:bg-white/10" />
                    <div className="p-4">
                      <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/10 rounded mb-4" />
                      <div className="h-10 bg-gray-100 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-slate-300">
                No projects found. Try adjusting filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => {
                  const categories = p.methodologies?.map((m) => m.category).filter(Boolean).slice(0, 2) ?? [];
                  const vint = p.vintages?.slice(0, 3) ?? [];
                  const sdgs = p.sustainableDevelopmentGoals?.slice(0, 6) ?? [];
                  const img = getProjectImage(p);

                  return (
                    <div
                      key={p.key}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden
                               dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="relative aspect-[16/9] bg-gray-100 dark:bg-white/10">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-gray-100 dark:from-teal-500/10 dark:to-white/5" />
                        )}

                        <div className="absolute top-3 right-3">
                          {p.hasSupply ? (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-1
                                           dark:bg-emerald-500/15 dark:text-emerald-200">
                              Supply
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/90 text-gray-700 text-[11px] font-semibold px-2 py-1
                                           dark:bg-black/40 dark:text-slate-200">
                              No supply
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/55 to-transparent">
                          <p className="text-white text-sm font-semibold line-clamp-2">{p.name}</p>
                          <p className="text-white/80 text-xs mt-0.5">
                            {p.key}
                            {p.country ? ` · ${p.country}` : ""} {p.registry ? ` · ${p.registry}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {categories.slice(0, 2).map((c, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-teal-50 text-teal-800 text-[11px] font-semibold px-2 py-1
                                       dark:bg-teal-500/15 dark:text-teal-200 dark:border dark:border-teal-500/20"
                            >
                              {c}
                            </span>
                          ))}

                          {vint.slice(0, 2).map((v) => (
                            <span
                              key={v}
                              className="rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-1
                                       dark:bg-white/10 dark:text-slate-200"
                            >
                              Vintage {v}
                            </span>
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-gray-600 dark:text-slate-300 line-clamp-3 min-h-[80px] max-h-[80px]">
                          {p.short_description || p.description || "No description available."}
                        </p>

                        <div className="mt-3 text-xs text-gray-600 dark:text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>Price</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatPrice(p.price)} USD
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span>Total Supply</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {p.stats?.totalSupply ?? "-"}
                            </span>
                          </div>
                        </div>

                        {sdgs.length ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {sdgs.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded-md bg-amber-50 text-amber-800 text-[11px] font-semibold px-2 py-1
                                         dark:bg-amber-500/15 dark:text-amber-200 dark:border dark:border-amber-500/20"
                              >
                                SDG {s}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => router.push(`/credits/${encodeURIComponent(p.key)}`)}
                            className="w-full inline-flex items-center justify-center h-10 rounded-xl
                                     bg-slate-900 text-white font-semibold shadow-sm
                                     hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-300
                                     dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 dark:focus:ring-white/20"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                onClick={() => applyFilters({ offset: Math.max(0, urlState.offset - urlState.limit) })}
                disabled={!canPrev || loading}
                className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-gray-100
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
              >
                ← Previous
              </button>

              <div className="text-sm text-gray-600 dark:text-slate-300">
                Page <b className="text-gray-900 dark:text-white">{page}</b> /{" "}
                <b className="text-gray-900 dark:text-white">{totalPages}</b> · Showing{" "}
                <b className="text-gray-900 dark:text-white">{showingFrom}</b>–{" "}
                <b className="text-gray-900 dark:text-white">{showingTo}</b> of{" "}
                <b className="text-gray-900 dark:text-white">{itemsCount}</b>
              </div>

              <button
                onClick={() => applyFilters({ offset: urlState.offset + urlState.limit })}
                disabled={!canNext || loading}
                className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-gray-100
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
