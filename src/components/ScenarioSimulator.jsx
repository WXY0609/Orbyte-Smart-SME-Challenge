import React from 'react';
import { CloudRain, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function ScenarioSimulator({ weather, setWeather, incident, setIncident, aiAlert }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" />
            AI Predictive Risk & Operations Hub
          </h2>
          <p className="text-sm text-slate-500">
            Real-time external factor monitor detecting weather anomalies and local incidents to prevent inventory waste.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          AI Agent Status: Active & Monitoring
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Control */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-500" /> Simulate Micro-Weather Condition
          </label>
          <select 
            value={weather} 
            onChange={(e) => setWeather(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="clear">☀️ Clear & Sunny (Normal Demand)</option>
            <option value="rain">🌧️ Heavy Rain / Thunderstorm (-35% Foot Traffic)</option>
            <option value="storm">⚡ Severe Storm / Typhoon (-75% Foot Traffic)</option>
          </select>
        </div>

        {/* Incident Control */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Simulate Local Road Incident
          </label>
          <select 
            value={incident} 
            onChange={(e) => setIncident(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="none">✅ Normal Traffic Flow</option>
            <option value="accident">🚧 Major Road Accident Nearby (-20% Walk-ins)</option>
            <option value="construction">🏗️ Emergency Road Construction Blockage</option>
          </select>
        </div>
      </div>

      {/* AI Intervention Banner */}
      {aiAlert && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 text-sm">AI Waste Prevention Protocol Triggered</h4>
            <p className="text-xs text-amber-700 mt-0.5">{aiAlert}</p>
          </div>
        </div>
      )}
    </div>
  );
}