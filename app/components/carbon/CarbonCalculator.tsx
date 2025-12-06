"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import CarbonForm from "./CarbonForm";
import CarbonDetailPreview from "./CarbonDetailPreview";

export interface CarbonEntry {
  id: string;
  resource: string;
  amount: number;
  recovery: string;
}

export default function CarbonCalculator() {
  const [entries, setEntries] = useState<CarbonEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<string | undefined>();

  const addEntry = () => {
    const newEntry: CarbonEntry = {
      id: Date.now().toString(),
      resource: "",
      amount: 0,
      recovery: "",
    };

    setEntries([newEntry, ...entries]);
    setActiveEntry(newEntry.id);
  };

  const updateEntry = (id: string, updated: CarbonEntry) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (activeEntry === id) setActiveEntry(undefined);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Carbon Emission Entries</h2>
        <Button onClick={addEntry}>+ Add Entry</Button>
      </div>

      <Accordion
        type="single"
        collapsible
        value={activeEntry}
        onValueChange={(val) => setActiveEntry(val)}
        className="space-y-3"
      >
        {entries.map((entry) => (
          <AccordionItem key={entry.id} value={entry.id}>
            <AccordionTrigger className="flex justify-between">
              <span className="font-medium">
                {entry.resource || "New Carbon Entry"}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEntry(entry.id);
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEntry(entry.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              {/* GRID CONTAINER INSIDE ACCORDION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border rounded-xl mt-3 bg-white shadow-sm">
                
                {/* LEFT: FORM */}
                <div className="border-r pr-4">
                  <CarbonForm
                    entry={entry}
                    onUpdate={(data) => updateEntry(entry.id, data)}
                  />
                </div>

                {/* RIGHT: DETAILS PREVIEW */}
                <div>
                  <CarbonDetailPreview entry={entry} />
                </div>

              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
