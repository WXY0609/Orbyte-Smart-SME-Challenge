import React from 'react';
import { DollarSign, ShieldAlert, PackageCheck, TrendingUp } from 'lucide-react';

export default function DashboardOverview({ weather, incident }) {
  const isRisky = weather !== 'clear' || incident !== 'none';
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Material Saved Today</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">$482.50</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> +18% efficiency vs last week
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Risk Status</p>
            <h3 className={`text-xl font-bold mt-1 ${isRisky ? 'text-amber-600' : 'text-emerald-600'}`}>
              {isRisky ? 'High Risk Alert' : 'Stable Operations'}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl ${isRisky ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {isRisky ? 'Weather/Incident detected' : 'Normal conditions'}
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perishable Inventory</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">124 Items</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2 font-medium">Auto-adjusted for today</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Carbon Offset</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">1.2 Tons</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Sustainable SME target</p>
      </div>
    </div>
  );
}