// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"

// export default function CarbonCalculator() {
//   const [cost, setCost] = useState("")
//   const [emission, setEmission] = useState<number | null>(null)

//   const calculateEmission = () => {
//     if (!cost) return
//     const result = Number(cost) * 0.0147
//     setEmission(Number(result.toFixed(4)))
//   }

//   const inputStyle =
//     "w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-black placeholder-gray-400 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 50, scale: 0.9 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.6 }}
//         className="w-full max-w-4xl grid md:grid-cols-2 gap-6 backdrop-blur-xl bg-white/90 p-6 rounded-2xl shadow-2xl"
//       >

//         {/* LEFT FORM */}
//         <div>
//           <h1 className="text-2xl font-bold mb-6 text-gray-800">
//             Carbon Emission Calculator
//           </h1>

//           {/* METHOD */}
//           <div className="mb-4">
//             <label className="font-medium">Calculation Method</label>
//             <select className={inputStyle}>
//               <option>Expense</option>
//             </select>
//           </div>

//           {/* DATABASE */}
//           <div className="mb-4">
//             <label className="font-medium">Database</label>
//             <select className={inputStyle}>
//               <option>EXIOBASE</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className=">Activity</label>
//               <input className={inputStyle} placeholder="Restaurant / Flight" />
//             </div>

//             <div>
//               <label className=">Date</label>
//               <input className={inputStyle} type="date" />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 mt-3">
//             <div>
//               <label className=">Code</label>
//               <input className={inputStyle} type="number" placeholder="300" />
//             </div>

//             <div>
//               <label className=">Cost</label>
//               <input
//                 className={inputStyle}
//                 type="number"
//                 value={cost}
//                 onChange={(e) => setCost(e.target.value)}
//                 placeholder="235.44"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 mt-3">
//             <div>
//               <label className=">Currency</label>
//               <select className={inputStyle}>
//                 <option>USD</option>
//                 <option>EUR</option>
//                 <option>GBP</option>
//               </select>
//             </div>

//             <div>
//               <label className=">Region</label>
//               <select className={inputStyle}>
//                 <option>India</option>
//                 <option>USA</option>
//                 <option>Germany</option>
//               </select>
//             </div>
//           </div>

//           {/* BUTTON */}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={calculateEmission}
//             className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl font-semibold shadow-lg"
//           >
//             Calculate Emission
//           </motion.button>
//         </div>

//         {/* RIGHT RESULT */}
//         <motion.div
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="bg-white rounded-2xl p-6 shadow-inner text-black"
//         >
//           <h2 className="text-xl font-bold mb-2 text-gray-800">
//             Result Dashboard
//           </h2>

//           <div className="text-center mt-10">
//             <p className="text-gray-600 mb-2">tCO2e Emission</p>

//             <motion.div
//               key={emission}
//               initial={{ scale: 0.5, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="text-5xl font-extrabold text-green-600"
//             >
//               {emission ?? "0.0000"}
//             </motion.div>

//             <p className="mt-4 text-sm text-gray-500">
//               Tonnes of CO₂ equivalent
//             </p>
//           </div>
//         </motion.div>

//       </motion.div>

//     </div>
//   )
// }





// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"

// import { Country, State, City } from "country-state-city"
// import { currencies } from "./data/currencies"

// const CODE_LIST = [500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600]

// export default function CarbonForm() {
//   const [carbonForm, setCarbonForms] = useState([createEmptyForm()])

//   function createEmptyForm() {
//     return {
//       method: "Expense",
//       database: "Axiobase",
//       activity: "",
//       date: new Date(),
//       code: "",
//       cost: "",
//       currency: "USD",

//       country: "",
//       state: "",
//       city: ""
//     }
//   }

//   const addNewForm = () => {
//     setCarbonForms([...carbonForm, createEmptyForm()])
//   }

//   const updateCarbonEntry = (index: number, field: string, value: any) => {
//     const copy = [...carbonForm] as any
//     copy[index][field] = value
//     setCarbonForms(copy)
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-10">

//       <h1 className="text-3xl font-bold mb-10">
//         🌍 Carbon Emission Calculator
//       </h1>

//       {carbonForm.map((form, i) => {
//         const states = State.getStatesOfCountry(form.country)
//         const cities = City.getCitiesOfState(form.country, form.state)

//         return (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className=" p-6 mb-10 rounded-xl shadow-lg border space-y-3"
//           >

//             {/* METHOD */}
//             <div className="grid grid-cols-2 gap-4">

//               <div>
//                 <label className="block mb-1 font-semibold">
//                   Calculation Method
//                 </label>
//                 <select
//                   defaultValue="Expense"
//                   className="w-full p-1 border rounded-lg "
//                 >
//                   <option>Expense</option>
//                 </select>
//               </div>

//               {/* DATABASE */}
//               <div>
//                 <label className="block mb-1 font-semibold">
//                   Database
//                 </label>
//                 <select
//                   defaultValue="Axiobase"
//                   className="w-full p-1 border rounded-lg "
//                 >
//                   <option>Axiobase</option>
//                 </select>
//               </div>
//             </div>

//             {/* ACTIVITY */}
//             <div>
//               <label className="block mb-1 font-semibold">
//                 Activity
//               </label>
//               <input
//                 className="w-full p-1 border rounded-lg"
//                 placeholder="Enter activity name"
//                 value={form.activity}
//                 onChange={(e) => updateCarbonEntry(i, "activity", e.target.value)}
//               />
//             </div>
//             {/* DATE */}
//             <div>
//               <label className="block mb-1 font-semibold">
//                 Date
//               </label>
//               <DatePicker
//                 selected={form.date}
//                 onChange={(date: any) => updateCarbonEntry(i, "date", date)}
//                 className="w-full p-1 border rounded-lg"
//               />
//             </div>

//             {/* CODE (special logic) */}
//             <div>
//               <label className="block mb-2 font-semibold">
//                 Activity Code
//               </label>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm mb-1">Select from list</label>
//                   <select
//                     value={form.code}
//                     onChange={(e) => updateCarbonEntry(i, "code", e.target.value)}
//                     className="w-full p-1 border rounded-lg"
//                   >
//                     <option value="">Select code</option>
//                     {CODE_LIST.map((val) => (
//                       <option key={val} value={val}>
//                         {val}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm mb-1">Or type manually</label>
//                   <input
//                     type="number"
//                     placeholder="Type code e.g. 700"
//                     value={form.code}
//                     className="w-full p-1 border rounded-lg"
//                     onChange={(e) => {
//                       const value = e.target.value
//                       updateCarbonEntry(i, "code", value)
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* COST */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block mb-1 font-semibold">
//                   Cost
//                 </label>
//                 <input
//                   type="number"
//                   placeholder="Enter cost"
//                   className="w-full p-1 border rounded-lg"
//                   value={form.cost}
//                   onChange={(e) => updateCarbonEntry(i, "cost", e.target.value)}
//                 />
//               </div>

//               {/* CURRENCY */}
//               <div>
//                 <label className="block mb-1 font-semibold">
//                   Currency
//                 </label>
//                 <select
//                   value={form.currency}
//                   onChange={(e) => updateCarbonEntry(i, "currency", e.target.value)}
//                   className="w-full p-1 border rounded-lg"
//                 >
//                   {currencies.map((c) => (
//                     <option key={c.code} value={c.code}>
//                       {c.code} - {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* FOREIGN DETAILS */}
//             <div>
//               <label className="block mb-2 font-semibold">
//                 Location Details
//               </label>

//               <div className="grid grid-cols-3 gap-4">
//                 {/* Country */}
//                 <div>
//                   <label className="block mb-1 text-sm">Country</label>
//                   <select
//                     value={form.country}
//                     onChange={(e) => {
//                       updateCarbonEntry(i, "country", e.target.value)
//                       updateCarbonEntry(i, "state", "")
//                       updateCarbonEntry(i, "city", "")
//                     }}
//                     className="w-full p-1 border rounded-lg"
//                   >
//                     <option value="">Select country</option>
//                     {Country.getAllCountries().map((c) => (
//                       <option key={c.isoCode} value={c.isoCode}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* State */}
//                 <div>
//                   <label className="block mb-1 text-sm">State</label>
//                   <select
//                     value={form.state}
//                     onChange={(e) => {
//                       updateCarbonEntry(i, "state", e.target.value)
//                       updateCarbonEntry(i, "city", "")
//                     }}
//                     className="w-full p-1 border rounded-lg"
//                   >
//                     <option value="">Select state</option>
//                     {states.map((s) => (
//                       <option key={s.isoCode} value={s.isoCode}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* City */}
//                 <div>
//                   <label className="block mb-1 text-sm">City / District</label>
//                   <select
//                     value={form.city}
//                     onChange={(e) => updateCarbonEntry(i, "city", e.target.value)}
//                     className="w-full p-1 border rounded-lg"
//                   >
//                     <option value="">Select city</option>
//                     {cities.map((c) => (
//                       <option key={c.name} value={c.name}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )
//       })}

//       {/* ADD MULTIPLE FORM */}
//       <button
//         onClick={addNewForm}
//         className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition"
//       >
//         + Add Another Entry
//       </button>

//     </div>
//   )
// }



// "use client";

// import { useState } from "react";
// import CarbonForm from "./components/CarbonForm";
// import CarbonAccordion from "./components/CarbonAccordion";

// export default function CarbonPage() {
//   const [entries, setEntries] = useState<any[]>([]);
//   const [editEntry, setEditEntry] = useState<any>(null);

//   /** Add New Entry */
//   const addEntry = (formData: any) => {
//     const newEntry = {
//       ...formData,
//       id: crypto.randomUUID(),
//     };

//     setEntries((prev) => [newEntry, ...prev]);
//   };

//   /** Update existing entry */
//   const updateEntry = (updated: any) => {
//     setEntries((prev) =>
//       prev.map((item) => (item.id === updated.id ? updated : item))
//     );
//   };

//   /** Delete entry */
//   const deleteCarbonEntry = (id: string) => {
//     setEntries((prev) => prev.filter((e) => e.id !== id));
//   };

//   return (
//     <div className="grid grid-cols-2 gap-8 p-10">
//       {/* LEFT  - FORM */}
//       <CarbonForm
//         onSubmit={addEntry}
//         editingData={editEntry}
//         onUpdate={updateEntry}
//         clearEdit={() => setEditEntry(null)}
//       />

//       {/* RIGHT - ACCORDION LIST */}
//       <CarbonAccordion
//         entries={entries}
//         onEdit={(entry: any) => setEditEntry(entry)}
//         onDelete={deleteCarbonEntry}
//       />
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import CarbonForm from "./CarbonForm";
// import CarbonDetailPreview from "./CarbonDetailPreview";

// export interface CarbonEntry {
//   id: string;
//   resource: string;
//   amount: number;
//   recovery: string;
// }

// export default function CarbonCalculator() {
//   const [entries, setEntries] = useState<CarbonEntry[]>([]);
//   const [activeEntry, setActiveEntry] = useState<string | undefined>();

//   const addEntry = () => {
//     const newEntry: CarbonEntry = {
//       id: Date.now().toString(),
//       resource: "",
//       amount: 0,
//       recovery: "",
//     };

//     setEntries([newEntry, ...entries]);
//     setActiveEntry(newEntry.id);
//   };

//   const updateEntry = (id: string, updated: CarbonEntry) => {
//     setEntries((prev) =>
//       prev.map((item) => (item.id === id ? updated : item))
//     );
//   };

//   const deleteCarbonEntry = (id: string) => {
//     setEntries((prev) => prev.filter((e) => e.id !== id));
//     if (activeEntry === id) setActiveEntry(undefined);
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between mb-4">
//         <h2 className="text-xl font-semibold">Carbon Emission Entries</h2>
//         <Button onClick={addEntry}>+ Add Entry</Button>
//       </div>

//       <Accordion
//         type="single"
//         collapsible
//         value={activeEntry}
//         onValueChange={(val) => setActiveEntry(val)}
//         className="space-y-3"
//       >
//         {entries.map((entry) => (
//           <AccordionItem key={entry.id} value={entry.id}>
//             <AccordionTrigger className="flex justify-between">
//               <span className="font-medium">
//                 {entry.resource || "New Carbon Entry"}
//               </span>

//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setActiveEntry(entry.id);
//                   }}
//                 >
//                   Edit
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="destructive"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     deleteCarbonEntry(entry.id);
//                   }}
//                 >
//                   Delete
//                 </Button>
//               </div>
//             </AccordionTrigger>

//             <AccordionContent>
//               {/* GRID CONTAINER INSIDE ACCORDION */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border rounded-xl mt-3 bg-white shadow-sm">

//                 {/* LEFT: FORM */}
//                 <div className="border-r pr-4">
//                   <CarbonForm
//                     entry={entry}
//                     onUpdate={(data) => updateEntry(entry.id, data)}
//                   />
//                 </div>

//                 {/* RIGHT: DETAILS PREVIEW */}
//                 <div>
//                   <CarbonDetailPreview entry={entry} />
//                 </div>

//               </div>
//             </AccordionContent>
//           </AccordionItem>
//         ))}
//       </Accordion>
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "./components/accordion/Accordion";

// import CarbonGraph from "./components/carbon/CarbonPieChart";
// import CarbonRecovery from "./components/carbon/CarbonRecovery";
// // import CarbonEntryCard from "./components/carbon/CarbonEntryCard";

// export default function CarbonForm() {
//   const [entries, setEntries] = useState<any[]>([]);
//   const [active, setActive] = useState<any>(null);
//   const [editingData, setEditingData] = useState<any>(null);

//   const addCarbonNewEntry = () => {
//     const newEntry = {
//       id: Date.now(),
//       activity: "",
//       cost: "",
//       code: "",
//       currency: "USD",
//       emission: 12,
//       city: "",
//       state: "",
//       country: "",
//       recovery: ["Tree plantation", "Renewable resource usage"],
//     };

//     setEntries([newEntry, ...entries]);
//     setActive(newEntry.id);
//     setEditingData(newEntry);
//   };

//   const updateField = (field: string, value: any) => {
//     setEditingData({ ...editingData, [field]: value });
//   };

//   const saveEntry = () => {
//     setEntries((prev) =>
//       prev.map((e) => (e.id === editingData.id ? editingData : e))
//     );
//   };

//   const deleteCarbonEntry = (id: number) => {
//     setEntries(entries.filter((e) => e.id !== id));
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto p-6">
//       <div>
//         <div className="flex items-center justify-between mb-6 border">
//           <h2 className="text-2xl font-semibold text-gray-800">
//             Carbon Emission Entries
//           </h2>

//           <button
//             onClick={addCarbonNewEntry}
//             className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-shadow shadow-sm hover:shadow-md"
//           >
//             + New Carbon Entry
//           </button>

//         </div>

//         <Accordion value={active} onValueChange={setActive}>
//           {entries.map((entry) => (
//             <AccordionItem key={entry.id} value={entry.id}>
//               {({ isOpen, toggle }: any) => (
//                 <>
//                   <AccordionTrigger isOpen={isOpen} toggle={toggle}>
//                     <span>{entry.activity || "Untitled Entry"}</span>

//                     <div className="flex gap-2">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setEditingData(entry);
//                           setActive(entry.id);
//                         }}
//                         className="px-2 py-1 text-xs border"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteCarbonEntry(entry.id);
//                         }}
//                         className="px-2 py-1 text-xs bg-red-500 text-white rounded"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </AccordionTrigger>

//                   <AccordionContent isOpen={isOpen}>
//                     {/* <CarbonEntryCard entry={entry} /> */}
//                   </AccordionContent>
//                 </>
//               )}
//             </AccordionItem>
//           ))}
//         </Accordion>
//       </div>

//       {/* RIGHT SIDE — GRAPH + FORM + RECOVERY */}
//       <div className="space-y-6">
//         {editingData && (
//           <>
//             <div className="p-4 border rounded-xl shadow">
//               <h2 className="font-semibold mb-4">Edit Entry</h2>

//               <input
//                 className="border p-2 rounded w-full mb-3"
//                 placeholder="Activity"
//                 value={editingData.activity}
//                 onChange={(e) => updateField("activity", e.target.value)}
//               />

//               <input
//                 className="border p-2 rounded w-full mb-3"
//                 placeholder="Cost"
//                 value={editingData.cost}
//                 onChange={(e) => updateField("cost", e.target.value)}
//               />

//               <input
//                 className="border p-2 rounded w-full mb-3"
//                 placeholder="Code"
//                 value={editingData.code}
//                 onChange={(e) => updateField("code", e.target.value)}
//               />

//               <button
//                 onClick={saveEntry}
//                 className="px-4 py-2 bg-blue-600 text-white rounded"
//               >
//                 Save Entry
//               </button>
//             </div>

//             <CarbonGraph data={editingData} />

//             <CarbonRecovery strategies={editingData.recovery} />
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import CarbonForm from "./components/carbon/CarbonForm";
// import CarbonGraph from "./components/carbon/CarbonPieChart";
// import CarbonRecovery from "./components/carbon/CarbonRecovery";
// import { AccordionItem } from "./components/accordion/Accordion";

// export default function CarbonEntries() {
//   const [active, setActive] = useState<any>(null);
//   const [carbonForm, setCarbonForms] = useState<any>([])

//   function createEmptyForm() {
//     return {
//       method: "Expense",
//       database: "Axiobase",
//       activity: "",
//       date: new Date(),
//       code: "",
//       cost: "",
//       currency: "USD",
//       country: "",
//     }
//   }

//   const addCarbonNewEntry = () => {
//     const newEntry: any = {
//       id: Date.now().toString(),
//       method: "Expense",
//       database: "Axiobase",
//       activity: "",
//       date: new Date(),
//       code: "",
//       cost: "",
//       currency: "USD",
//       emission: 12,
//       recovery: ["Tree plantation", "Renewable resource usage"],
//       country: "",
//     };

//     setCarbonForms([newEntry, ...carbonForm])
//     setActive(newEntry.id); // open accordion
//   };


//   const deleteCarbonEntry = (id: string) => {
//     setCarbonForms((prev) => prev.filter((e) => e.id !== id));
//     if (active === id) setActive(null);
//   };

//   const updateCarbonEntry = (index: number, field: string, value: any) => {
//     const copy = [...carbonForm] as any
//     copy[index][field] = value
//     setCarbonForms(copy)
//   }

//   const addActivityEntry = (index: number) => {
//     const copy = [...carbonForm] as any
//     copy[index] = [...copy[index], createEmptyForm()]
//     setCarbonForms(copy)
//   }


//   return (
//     <div className=" mx-auto p-6">

//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Carbon Emission Entries
//         </h1>

//         <button
//           onClick={addCarbonNewEntry}
//           className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm hover:shadow-md transition"
//         >
//           + New Carbon Entry
//         </button>
//       </div>

//       {/* ACCORDIONS */}
//       {carbonForm.map((entry: any) => (
//         <AccordionItem
//           key={entry.id}
//           id={entry.id}
//           title={entry.activity}
//           active={active}
//           setActive={setActive}
//           actions={
//             <>
//               <button
//                 className="px-4 py-1 text-md bg-teal-600 text-white rounded"
//                 onClick={() => setActive(entry.id)}
//               >
//                 Edit
//               </button>

//               <button
//                 className="px-4 py-1 text-md bg-red-800 text-white rounded"
//                 onClick={() => deleteCarbonEntry(entry.id)}
//               >
//                 Delete
//               </button>
//             </>
//           }
//         >
//           {/* INSIDE ACCORDION: Left Form | Right Graph */}
//           <div className="grid grid-cols-2 gap-6">

//             {/* LEFT – FORM */}
//             <CarbonForm
//               carbonEntry={entry}
//               addActivityEntry={addActivityEntry}
//               updateCarbonEntry={(field, value) => updateCarbonEntry(entry.id, field, value)}
//             />

//             {/* RIGHT – GRAPH + RECOVERY */}
//             <div className="space-y-6">
//               <CarbonGraph data={entry} />
//               <CarbonRecovery strategies={entry?.recovery} />
//             </div>

//           </div>
//         </AccordionItem>
//       ))}
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import CarbonForm from "./components/carbon/CarbonForm";
import CarbonGraph from "./components/carbon/CarbonPieChart";
import CarbonRecovery from "./components/carbon/CarbonRecovery";
import { AccordionItem } from "./components/accordion/Accordion";

export default function CarbonEntries() {

  const createEmptyActivity = () => ({
    method: "Expense",
    database: "Axiobase",
    activity: "",
    date: new Date(),
    code: "",
    cost: "",
    currency: "USD",
    country: "",
  });

  const addCarbonNewEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      activities: [createEmptyActivity()],
      emission: 12,
      recovery: ["Tree plantation", "Renewable resource usage"],
    };

    setCarbonForms([newEntry, ...carbonForm]);
    setActive(newEntry.id);
  };

  const [active, setActive] = useState<any>(null);
  const [carbonForm, setCarbonForms] = useState<any>([]);

  // DELETE ENTRY
  const deleteCarbonEntry = (id: string) => {
    setCarbonForms((prev) => prev.filter((e) => e.id !== id));
    if (active === id) setActive(null);
  };

  // ADD ACTIVITY INSIDE ENTRY
  const addActivityEntry = (entryId: string) => {
    setCarbonForms((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
            ...entry,
            activities: [...entry.activities, createEmptyActivity()],
          }
          : entry
      )
    );
  };

  // UPDATE SINGLE ACTIVITY
  const updateActivity = (
    entryId: string,
    activityIndex: number,
    field: string,
    value: any
  ) => {
    setCarbonForms((prev: any) =>
      prev.map((entry: any) =>
        entry.id === entryId
          ? {
            ...entry,
            activities: entry.activities.map((a: any, i: number) =>
              i === activityIndex ? { ...a, [field]: value } : a
            ),
          }
          : entry
      )
    );
  };

  return (
    <div className="mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Carbon Emission Entries</h1>

        <button
          onClick={addCarbonNewEntry}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg"
        >
          + New Carbon Entry
        </button>
      </div>

      {carbonForm.map((entry: any) => (
        <AccordionItem
          key={entry.id}
          id={entry.id}
          title={entry.activities[0]?.activity || "Untitled Entry"}
          active={active}
          setActive={setActive}
          actions={
            <>
              <button
                className="px-4 py-1 bg-teal-600 text-white rounded"
                onClick={() => setActive(entry.id)}
              >
                Edit
              </button>
              <button
                className="px-4 py-1 bg-red-700 text-white rounded"
                onClick={() => deleteCarbonEntry(entry.id)}
              >
                Delete
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-6">

            {/* FORM */}
            <CarbonForm
              entryId={entry.id}
              activities={entry.activities}
              addActivityEntry={addActivityEntry}
              updateActivity={updateActivity}
            />

            <div className="space-y-6">
              <CarbonGraph data={entry} />
              <CarbonRecovery strategies={entry.recovery} />
            </div>

          </div>
        </AccordionItem>
      ))}

    </div>
  );
}
