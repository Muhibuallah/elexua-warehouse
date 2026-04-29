
import { useState } from "react";

export default function GlobalSearch({ data=[], onSelect }) {
  const [query,setQuery]=useState("");

  const results=data.filter(item=>{
    if(!query) return false;
    const text=JSON.stringify(item).toLowerCase();
    return text.includes(query.toLowerCase());
  }).slice(0,20);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[500px] bg-white shadow-xl rounded-xl z-50 p-4">
      <input
        autoFocus
        value={query}
        onChange={e=>setQuery(e.target.value)}
        placeholder="Search products, boxes, orders..."
        className="w-full border p-2 rounded mb-2"
      />

      <div className="max-h-60 overflow-y-auto">
        {results.map((r,i)=>(
          <div
            key={i}
            onClick={()=>onSelect && onSelect(r)}
            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            {r.productName || r.boxLabel || r.customerName || "Record"}
          </div>
        ))}
      </div>
    </div>
  );
}
