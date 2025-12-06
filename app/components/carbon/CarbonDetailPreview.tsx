"use client";

import CarbonPieChart from "./CarbonPieChart";
import { CarbonEntry } from "./CarbonCalculator";

export default function CarbonDetailPreview({ entry }: { entry: CarbonEntry }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Preview</h3>

      <div className="border rounded-lg p-3 shadow-sm">
        <CarbonPieChart value={entry.amount} label={entry.resource} />
      </div>

      <div className="border rounded-lg p-3 shadow-sm">
        <h4 className="font-medium mb-1">Recovery Method</h4>
        <p className="text-gray-700">{entry.recovery || "Not provided"}</p>
      </div>
    </div>
  );
}
