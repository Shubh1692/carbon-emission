"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac"];

export default function CarbonAccordion({ entries, onEdit, onDelete }: any) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className="space-y-4 w-full"
      defaultValue={entries[0]?.id}
    >
      {entries.map((entry: any) => {
        const pieData = [
          { name: "Fuel", value: entry.cost * 0.4 },
          { name: "Electricity", value: entry.cost * 0.3 },
          { name: "Travel", value: entry.cost * 0.2 },
          { name: "Waste", value: entry.cost * 0.1 },
        ];

        return (
          <Accordion.Item
            value={entry.id}
            key={entry.id}
            className="border rounded-lg bg-white shadow"
          >
            <Accordion.Trigger className="w-full p-4 flex justify-between cursor-pointer">
              <span className="font-semibold">{entry.activity}</span>
              <span className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </Accordion.Trigger>

            <Accordion.Content className="p-4 border-t bg-gray-50 space-y-4">
              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-1 bg-red-600 text-white rounded"
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>Code: {entry.code}</p>
                <p>Cost: {entry.cost}</p>
                <p>Country: {entry.country}</p>
                <p>City: {entry.city}</p>
              </div>

              {/* Pie Chart */}
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Recovery Section */}
              <div className="p-4 bg-white border rounded-lg">
                <h3 className="font-bold mb-2">🌱 Recovery Actions</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Purchased renewable energy credits</li>
                  <li>Tree plantation program</li>
                  <li>Carbon offset subscription</li>
                </ul>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
