import React, { useState } from 'react';
import { Package, Check, Edit3 } from 'lucide-react';

export default function InventoryTracker({ weather, incident }) {
  const discountFactor = (weather !== 'clear' ? 0.35 : 0) + (incident !== 'none' ? 0.20 : 0);

  const initialItems = [
    { id: 1, name: 'Fresh Dairy & Milk (Liters)', normal: 50, unit: 'L' },
    { id: 2, name: 'Pre-prepared Bakery Buns', normal: 120, unit: 'pcs' },
    { id: 3, name: 'Fresh Salad Greens', normal: 40, unit: 'packs' },
    { id: 4, name: 'Raw Gourmet Meat', normal: 30, unit: 'kg' },
  ];

  const [isApproved, setIsApproved] = useState(true);
  const [customQtys, setCustomQtys] = useState(
    initialItems.reduce((acc, item) => {
      acc[item.id] = Math.round(item.normal * (1 - discountFactor));
      return acc;
    }, {})
  );

  return (
    <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Smart Inventory Adjustment
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Approve AI-suggested quantities or customize prep levels manually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApproved(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isApproved ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> Approve AI Plan
          </button>
          <button
            onClick={() => setIsApproved(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              !isApproved ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Custom Input
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="py-3 px-4">Material Name</th>
              <th className="py-3 px-4">Standard Qty</th>
              <th className="py-3 px-4">{isApproved ? 'AI Suggested Qty' : 'Custom Prep Qty'}</th>
              <th className="py-3 px-4">Prevented Waste</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {initialItems.map((item) => {
              const aiRecommended = Math.round(item.normal * (1 - discountFactor));
              const activeQty = isApproved ? aiRecommended : (customQtys[item.id] ?? aiRecommended);
              const saved = item.normal - activeQty;

              return (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-medium text-slate-200">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.normal} {item.unit}</td>
                  <td className="py-3.5 px-4">
                    {isApproved ? (
                      <span className="font-bold text-cyan-400">{aiRecommended} {item.unit}</span>
                    ) : (
                      <input
                        type="number"
                        value={activeQty}
                        onChange={(e) => setCustomQtys({ ...customQtys, [item.id]: Number(e.target.value) })}
                        className="w-20 p-1.5 border border-slate-700 bg-slate-800 rounded-lg text-xs text-cyan-400 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium">+{saved >= 0 ? saved : 0} {item.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}