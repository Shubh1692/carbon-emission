"use client";

import React, { useMemo } from "react";
import { Doughnut, Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
  BubbleController,
  type ChartOptions,
} from "chart.js";
import { useTheme } from "next-themes";
import { ActivityBI } from "@/lib/types/carbon-emission";

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, PointElement, BubbleController);

type Props = { activities: ActivityBI[] };

const COLORS = [
  "#0f766e", "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7",
  "#f43f5e", "#f97316", "#eab308", "#22c55e", "#64748b",
  "#1d4ed8", "#06b6d4", "#10b981", "#84cc16", "#facc15",
  "#fb923c", "#be123c", "#7c3aed", "#0f172a", "#94a3b8",
];

const pickColors = (n: number) => Array.from({ length: n }, (_, i) => COLORS[i % COLORS.length]);
const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");

export default function CarbonAnalyticsPage({ activities }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const vm = useMemo(() => {
    const rows = Array.isArray(activities) ? activities : [];
    const map = new Map<string, { co2e: number; activity: number; unit: string }>();

    for (const r of rows) {
      const name = r?.estimateResult?.emission_factor?.name ?? "Unknown";
      const co2e = Number(r?.estimateResult?.co2e ?? 0);
      const act = Number(r?.estimateResult?.activity_data?.activity_value ?? 0);
      const unit = r?.estimateResult?.activity_data?.activity_unit ?? "";

      const prev = map.get(name);
      map.set(name, {
        co2e: (prev?.co2e ?? 0) + (Number.isFinite(co2e) ? co2e : 0),
        activity: (prev?.activity ?? 0) + (Number.isFinite(act) ? act : 0),
        unit: prev?.unit ?? unit,
      });
    }

    const labels = Array.from(map.keys());
    const co2e = labels.map((k) => map.get(k)!.co2e);
    const activity = labels.map((k) => map.get(k)!.activity);
    const unit = labels.map((k) => map.get(k)!.unit).find(Boolean) ?? "";

    const totalCo2e = co2e.reduce((a, b) => a + b, 0);

    let topIdx = 0;
    for (let i = 1; i < co2e.length; i++) if (co2e[i] > co2e[topIdx]) topIdx = i;

    const bubblePoints = rows
      .map((r) => {
        const x = Number((r as ActivityBI)?.unitValue ?? 0);
        const y = Number(r?.estimateResult?.co2e ?? 0);
        if (!Number.isFinite(x) || !Number.isFinite(y) || y <= 0) return null;

        const name = r?.estimateResult?.emission_factor?.name ?? "Unknown";
        const intensity = x > 0 ? y / x : null;

        return {
          x,
          y,
          r: Math.max(4, Math.min(18, Math.sqrt(y) * 2)),
          name,
          intensity,
          unitLabel: r?.estimateResult?.activity_data?.activity_unit ?? unit ?? "",
        };
      })
      .filter(Boolean) as Array<{
      x: number;
      y: number;
      r: number;
      name: string;
      intensity: number | null;
      unitLabel: string;
    }>;

    return {
      labels,
      co2e,
      activity,
      unit,
      totalCo2e,
      topFactor: labels[topIdx] ?? "-",
      topCo2e: co2e[topIdx] ?? 0,
      colors: pickColors(labels.length),
      bubblePoints,
    };
  }, [activities]);

  if (!activities?.length) return null;

  // Theme helpers for Chart.js
  const chartText = isDark ? "rgba(229,231,235,0.92)" : "rgba(17,24,39,0.92)";
  const chartMuted = isDark ? "rgba(148,163,184,0.95)" : "rgba(107,114,128,0.95)";
  const chartGrid = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const tooltipBg = isDark ? "rgba(2,6,23,0.92)" : "rgba(255,255,255,0.98)";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)";

  const doughnut1 = {
    labels: vm.labels,
    datasets: [
      {
        label: "CO2e (kg)",
        data: vm.co2e,
        backgroundColor: vm.colors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: chartMuted,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: chartText,
        bodyColor: chartText,
        callbacks: {
          label: (ctx) => {
            const raw = Number(ctx.raw ?? 0);
            const label = ctx.label ?? "";
            const dsLabel = ctx.dataset.label ?? "";
            return `${dsLabel}: ${label} — ${fmt(raw)}`;
          },
        },
      },
    },
  };

  const bubbleData = {
    datasets: [
      {
        label: "Unit Value vs CO2e",
        data: vm.bubblePoints,
        backgroundColor: "rgba(20, 184, 166, 0.35)",
        borderColor: "rgba(20, 184, 166, 0.9)",
        borderWidth: 1,
      },
    ],
  };

  const bubbleOptions: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom", labels: { color: chartMuted } },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: chartText,
        bodyColor: chartText,
        callbacks: {
          label: (ctx) => {
            const raw: Partial<{
              x: number;
              y: number;
              intensity: number;
              unitLabel: string;
              name: string;
            }> = (ctx.raw as any) || {};
            const x = Number(raw.x ?? 0);
            const y = Number(raw.y ?? 0);
            const intensity = Number.isFinite(raw.intensity) && raw.intensity != null ? raw.intensity : null;
            const unitLabel = raw.unitLabel || vm.unit || "unit";
            const name = raw.name || "";

            return [
              name,
              `Unit Value: ${fmt(x)} (${unitLabel})`,
              `CO2e: ${fmt(y)} kg`,
              `Intensity: ${intensity == null ? "N/A" : `${intensity.toFixed(4)} kg / unit`}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: chartGrid },
        ticks: { color: chartMuted },
        title: { display: true, text: `Unit Value (${vm.unit || "unit"})`, color: chartText },
      },
      y: {
        grid: { color: chartGrid },
        ticks: { color: chartMuted },
        title: { display: true, text: "CO2e (kg)", color: chartText },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Mini summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-slate-300">Total CO2e</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{fmt(vm.totalCo2e)} kg</p>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">By emission factors</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-[11px] font-medium text-gray-500 dark:text-slate-300">Top factor</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{vm.topFactor}</p>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{fmt(vm.topCo2e)} kg</p>
        </div>
      </div>

      {/* Doughnut */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-white/5">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">CO2e by emission factor</p>
          <p className="text-xs text-gray-500 dark:text-slate-300">Share of total emissions (kg)</p>
        </div>
        <div className="p-4">
          <div className="h-64">
            <Doughnut data={doughnut1} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bubble */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-white/5">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Activity vs CO2e (bubble)</p>
          <p className="text-xs text-gray-500 dark:text-slate-300">
            X: unit value · Y: CO2e (kg) · bubble size: CO2e · hover for kg/unit intensity
          </p>
        </div>
        <div className="p-4">
          <div className="h-72">
            <Bubble data={bubbleData} options={bubbleOptions} />
          </div>
          {!vm.bubblePoints?.length && (
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-300">
              No points available (missing unitValue / CO2e).
            </p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-white/5">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Breakdown</p>
          <p className="text-xs text-gray-500 dark:text-slate-300">Sorted by CO2e</p>
        </div>

        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-gray-500 border-b border-gray-200
                               dark:bg-slate-950/40 dark:text-slate-300 dark:border-white/10">
              <tr>
                <th className="py-2 px-4">Factor</th>
                <th className="py-2 px-4">CO2e (kg)</th>
                <th className="py-2 px-4">Activity</th>
              </tr>
            </thead>
            <tbody>
              {vm.labels
                .map((name, idx) => ({
                  name,
                  co2e: vm.co2e[idx],
                  act: vm.activity[idx],
                  color: vm.colors[idx],
                }))
                .sort((a, b) => b.co2e - a.co2e)
                .map((r) => (
                  <tr key={r.name} className="border-b border-gray-200 last:border-b-0 dark:border-white/10">
                    <td className="py-2 px-4">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-[10px] min-w-[10px] rounded-full" style={{ backgroundColor: r.color }}>
                          &nbsp;
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2">{r.name}</p>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-gray-700 dark:text-slate-200">{fmt(r.co2e)}</td>
                    <td className="py-2 px-4 text-gray-700 dark:text-slate-200">
                      {fmt(r.act)} {vm.unit || ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
