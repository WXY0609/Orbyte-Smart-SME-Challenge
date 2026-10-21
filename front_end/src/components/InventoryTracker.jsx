import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export default function InventoryTracker({ weather, incident }) {
  const discountFactor = (weather !== 'clear' ? 0.35 : 0) + (incident !== 'none' ? 0.20 : 0);

  const inventoryItems = [
    { name: 'Fresh Dairy & Milk (Liters)', normal: 50, unit: 'L' },
    { name: 'Pre-prepared Bakery Buns', normal: 120, unit: 'pcs' },
    { name: 'Fresh Salad Greens', normal: 40, unit: 'packs' },
    { name: 'Raw Gourmet Meat', normal: 30, unit: 'kg' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          AI Smart Inventory & Material Adjustment
        </h3>
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
          Live Adjustment Rate: -{Math.round(discountFactor * 100)}%
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        The AI assistant dynamically lowers preparation targets on high-risk days to prevent over-stocking and business waste.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
              <th className="py-3 px-4">Material Name</th>
              <th className="py-3 px-4">Normal Prep Qty</th>
              <th className="py-3 px-4">AI Recommended Qty</th>
              <th className="py-3 px-4">Waste Prevented</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventoryItems.map((item, idx) => {
              const adjusted = Math.round(item.normal * (1 - discountFactor));
              const saved = item.normal - adjusted;
              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500">{item.normal} {item.unit}</td>
                  <td className="py-3 px-4 font-bold text-indigo-600">{adjusted} {item.unit}</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">+{saved} {item.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}