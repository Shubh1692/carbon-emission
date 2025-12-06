"use client";

import { Pie } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CarbonGraph({ data }: any) {
    if (!data) return null;

    const emission = data.emission ?? 0;
    const remaining = Math.max(0, 100 - emission);

    const chartData = {
        labels: ["Emission (tons)", "Remaining"],
        datasets: [
            {
                data: [emission, remaining],
                backgroundColor: ["#009689", "#e5e7eb"],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        cutout: "80%", 
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
        },
    };

    return (
        <div className="p-4 rounded-xl border shadow-md bg-white">
            <h3 className="font-semibold mb-3">Carbon Emission Breakdown</h3>
            <div className="w-full h-60">
                <Doughnut data={chartData} options={options} />
            </div>
            {/* <p className="mt-2 font-medium text-gray-700">
                {emission}% Emission
            </p> */}
        </div>
    );
}
