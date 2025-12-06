// "use client";

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// import { Country, State, City } from "country-state-city";

// export default function CarbonForm({ entry, update }: any) {
//   const states = State.getStatesOfCountry(entry.country || "");
//   const cities = City.getCitiesOfState(entry.country || "", entry.state || "");

//   return (
//     <div className="space-y-4">

//       {/* Activity */}
//       <div>
//         <label className="text-sm font-medium text-gray-700">Activity</label>
//         <input
//           className="w-full mt-1 p-2 border rounded"
//           placeholder="Enter activity"
//           value={entry.activity}
//           onChange={(e) => update("activity", e.target.value)}
//         />
//       </div>

//       {/* Date */}
//       <div>
//         <label className="text-sm font-medium text-gray-700">Date</label>
//         <DatePicker
//           selected={entry.date ? new Date(entry.date) : new Date()}
//           onChange={(value) => update("date", value)}
//           className="w-full mt-1 p-2 border rounded"
//         />
//       </div>

//       {/* Code */}
//       <div>
//         <label className="text-sm font-medium text-gray-700">Activity Code</label>
//         <input
//           type="number"
//           className="w-full mt-1 p-2 border rounded"
//           placeholder="Enter code"
//           value={entry.code}
//           onChange={(e) => update("code", e.target.value)}
//         />
//       </div>

//       {/* Cost */}
//       <div>
//         <label className="text-sm font-medium text-gray-700">Cost</label>
//         <input
//           type="number"
//           className="w-full mt-1 p-2 border rounded"
//           placeholder="Enter cost"
//           value={entry.cost}
//           onChange={(e) => update("cost", e.target.value)}
//         />
//       </div>

//       {/* Currency */}
//       <div>
//         <label className="text-sm font-medium text-gray-700">Currency</label>
//         <select
//           className="w-full mt-1 p-2 border rounded"
//           value={entry.currency}
//           onChange={(e) => update("currency", e.target.value)}
//         >
//           <option value="USD">USD</option>
//           <option value="INR">INR</option>
//           <option value="EUR">EUR</option>
//         </select>
//       </div>

//       {/* Location */}
//       <div className="space-y-3">
//         <label className="text-sm font-medium text-gray-700">
//           Location
//         </label>

//         {/* Country */}
//         <select
//           className="w-full p-2 border rounded"
//           value={entry.country}
//           onChange={(e) => {
//             update("country", e.target.value);
//             update("state", "");
//             update("city", "");
//           }}
//         >
//           <option value="">Select Country</option>
//           {Country.getAllCountries().map((c) => (
//             <option key={c.isoCode} value={c.isoCode}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         {/* State */}
//         <select
//           className="w-full p-2 border rounded"
//           value={entry.state}
//           onChange={(e) => {
//             update("state", e.target.value);
//             update("city", "");
//           }}
//         >
//           <option value="">Select State</option>
//           {states.map((s) => (
//             <option key={s.isoCode} value={s.isoCode}>
//               {s.name}
//             </option>
//           ))}
//         </select>

//         {/* City */}
//         <select
//           className="w-full p-2 border rounded"
//           value={entry.city}
//           onChange={(e) => update("city", e.target.value)}
//         >
//           <option value="">Select City</option>
//           {cities.map((c) => (
//             <option key={c.name} value={c.name}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }












// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"
// import Select from "react-select"

// import { Country, State, City } from "country-state-city"
// import { currencies } from "../../data/currencies"

// const CODE_LIST = [500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600]

// const CODE_OPTIONS = CODE_LIST.map((c) => ({
//   value: c,
//   label: c.toString(),
// }))

// export default function CarbonForm({ carbonEntry, addActivityEntry }: any) {

//   // const update = (index: number, field: string, value: any) => {
//   //   const copy = [...forms] as any
//   //   copy[index][field] = value
//   //   setForms(copy)
//   // }

//   return (
//     <div className="rounded-xl shadow-lg border overflow-hidden">
//       <button
//         onClick={addActivityEntry}
//         className="px-6 py-3 rounded transition text-teal-800 font-bold text-end w-full"
//       >
//         + Add Another Entry
//       </button>
//       {carbonEntry.map((form: any, i: number) => {
//         const states = State.getStatesOfCountry(form.country)
//         const cities = City.getCitiesOfState(form.country, form.state)


//         const countryOptions = Country.getAllCountries()?.map((c) => ({ value: c?.isoCode, label: c.name })) as any
//         const currencyOptions = currencies?.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` })) as any
//         return (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className=" p-5 space-y-3 shadow-inner border-t border-gray-200"
//           >

//             {/* ACTIVITY */}
//             <div>
//               <label className="block mb-1 font-semibold">
//                 Activity
//               </label>
//               <input
//                 className="w-full px-4 py-2 border border-gray-300 rounded"
//                 placeholder="Enter activity name"
//                 value={form.activity}
//                 onChange={(e) => update(i, "activity", e.target.value)}
//               />
//             </div>

//             {/* FOREIGN DETAILS */}
//             <div>
//               <label className="block mb-2 font-semibold">
//                 Location Details
//               </label>

//               <div className="grid grid-cols-3 gap-4">
//                 {/* Country */}

//                 <Select
//                   options={countryOptions}
//                   value={countryOptions.find((item: any) => item.value === form.country)}
//                   onChange={(selected) => update(i, "country", selected?.value)}
//                   placeholder="Select country"
//                   isClearable
//                   className="text-black"
//                 />
//               </div>
//             </div>


//             {/* METHOD */}
//             <label className="block mb-1 font-semibold">
//               Calculation Method
//             </label>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <Select
//                   options={[{ value: "Expense", label: "Expense" }]}
//                   value={{ value: "Expense", label: "Expense" }}
//                   onChange={(selected) => update(i, "method", selected?.value)}
//                   placeholder="Calculation Method"
//                   isClearable
//                   className="text-black"
//                 />
//               </div>

//               {/* DATABASE */}
//               <div>
//                 <Select
//                   options={[{ value: "Axiobase", label: "Axiobase" }]}
//                   value={{ value: "Axiobase", label: "Axiobase" }}
//                   onChange={(selected) => update(i, "database", selected?.value)}
//                   placeholder="Database"
//                   isClearable
//                   className="text-black"
//                 />
//               </div>

//               {/* DATE */}
//               <div>
//                 <DatePicker
//                   selected={form.date}
//                   onChange={(date: any) => update(i, "date", date)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded"
//                 />
//               </div>
//             </div>

//             {/* CODE (special logic) */}
//             <div>
//               <label className="block mb-2 font-semibold">
//                 Activity Code
//               </label>

//               {/* CODE (React Select) */}
//               <div>
//                 {/* <label className="block mb-2 font-semibold">Activity Code</label> */}

//                 <Select
//                   options={CODE_OPTIONS}
//                   value={CODE_OPTIONS.find((item) => item.value === Number(form.code))}
//                   onChange={(selected) => update(i, "code", selected?.value || "")}
//                   placeholder="Select activity code"
//                   isClearable
//                   className="text-black"
//                 />
//               </div>


//               {/* <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <select
//                     value={form.code}
//                     onChange={(e) => update(i, "code", e.target.value)}
//                     className="w-full px-4 py-2 border rounded"
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
//                   <input
//                     type="number"
//                     placeholder="Type code e.g. 700"
//                     value={form.code}
//                     className="w-full px-4 py-2 border rounded"
//                     onChange={(e) => {
//                       const value = e.target.value
//                       update(i, "code", value)
//                     }}
//                   />
//                 </div>
//               </div> */}
//             </div>

//             {/* COST */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 {/* <label className="block mb-1 font-semibold">
//                   Cost
//                 </label> */}
//                 <input
//                   type="number"
//                   placeholder="Enter cost"
//                   className="w-full px-4 py-2 border border-gray-300 rounded"
//                   value={form.cost}
//                   onChange={(e) => update(i, "cost", e.target.value)}
//                 />
//               </div>

//               {/* CURRENCY */}
//               <div>
//                 <Select
//                   options={currencyOptions}
//                   value={currencyOptions.find((item: Record<string, string>) => item.value === form.currency)}
//                   onChange={(selected) => update(i, "currency", selected?.value || "")}
//                   placeholder="Select Currency"
//                   isClearable
//                   className="text-black"
//                 />
//               </div>
//             </div>

//           </motion.div>
//         )
//       })}

//     </div>
//   )
// }





"use client";

import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

import { Country } from "country-state-city";
import { currencies } from "../../data/currencies";

const CODE_LIST = [500, 510, 520, 530, 540, 550];
const CODE_OPTIONS = CODE_LIST.map((code) => ({ value: code, label: code }));

export default function CarbonForm({
  entryId,
  activities,
  addActivityEntry,
  updateActivity,
}: any) {
   
  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <div className="rounded-xl shadow-lg border overflow-hidden">

      <button
        onClick={() => addActivityEntry(entryId)}
        className="px-6 py-3 w-full bg-gray-100 text-teal-700 font-bold"
      >
        + Add Another Activity
      </button>

      {activities.map((form: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 shadow-inner border-t space-y-4"
        >

          {/* ACTIVITY */}
          <div>
            <label className="block mb-1 font-semibold">Activity</label>
            <input
              className="w-full px-4 py-2 border rounded"
              value={form.activity}
              onChange={(e) =>
                updateActivity(entryId, i, "activity", e.target.value)
              }
            />
          </div>

          {/* COUNTRY */}
          <Select
            options={countryOptions}
            value={countryOptions.find((a) => a.value === form.country)}
            onChange={(opt) => updateActivity(entryId, i, "country", opt?.value)}
            placeholder="Select country"
            isClearable
          />

          {/* METHOD / DB / DATE */}
          <div className="grid grid-cols-3 gap-4">
            <Select
              options={[{ value: "Expense", label: "Expense" }]}
              value={{ value: "Expense", label: "Expense" }}
              onChange={(opt) => updateActivity(entryId, i, "method", opt?.value)}
            />

            <Select
              options={[{ value: "Axiobase", label: "Axiobase" }]}
              value={{ value: "Axiobase", label: "Axiobase" }}
              onChange={(opt) => updateActivity(entryId, i, "database", opt?.value)}
            />

            <DatePicker
              selected={form.date}
              onChange={(date) => updateActivity(entryId, i, "date", date)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* CODE */}
          <Select
            options={CODE_OPTIONS}
            value={CODE_OPTIONS.find((o) => o.value === Number(form.code))}
            onChange={(opt) =>
              updateActivity(entryId, i, "code", opt?.value || "")
            }
            placeholder="Select code"
          />

          {/* COST + CURRENCY */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="w-full px-4 py-2 border rounded"
              value={form.cost}
              onChange={(e) =>
                updateActivity(entryId, i, "cost", e.target.value)
              }
              placeholder="Enter cost"
            />

            <Select
              options={currencyOptions}
              value={currencyOptions.find((a) => a.value === form.currency)}
              onChange={(opt) =>
                updateActivity(entryId, i, "currency", opt?.value || "")
              }
              placeholder="Select currency"
            />
          </div>

        </motion.div>
      ))}
    </div>
  );
}
