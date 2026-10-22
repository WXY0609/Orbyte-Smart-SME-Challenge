import React from 'react';
import { DollarSign, ShieldAlert, PackageCheck, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardOverview({ weather, incident }) {
  const isRisky = weather !== 'clear' || incident !== 'none';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-xs text-slate-400">Real-time business performance & footfall tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Material Saved Today</p>
              <h3 className="text-3xl font-bold text-white mt-1">$5,200</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> -$0 vs normal baseline
          </p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Footfall Demand Index</p>
              <h3 className="text-3xl font-bold text-white mt-1">100%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Adjusted for rain & road incidents</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Risk Status</p>
              <h3 className={`text-xl font-bold mt-2 ${isRisky ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isRisky ? 'High Risk Alert' : 'Stable Operations'}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${isRisky ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isRisky ? 'Anomalies detected in area' : 'Optimal sales environment'}
          </p>
        </div>
      </div>

      <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80">
        <h3 className="text-lg font-bold text-white mb-2">AI Material & Operational Action Plan</h3>
        <p className="text-xs text-slate-400 mb-4">Optimal sales environment detected. Maintain standard operational procedures.</p>
        
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <PackageCheck className="w-6 h-6 text-cyan-400" />
          <div>
            <h4 className="text-sm font-semibold text-white">Standard Daily Preparation</h4>
            <p className="text-xs text-slate-400">No reduction necessary.</p>
          </div>
        </div>
      </div>
    </div>
  );
}