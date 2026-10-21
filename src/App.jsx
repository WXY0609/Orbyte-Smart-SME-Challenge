import React, { useState } from 'react';
import ScenarioSimulator from './components/ScenarioSimulator';
import DashboardOverview from './components/DashboardOverview';
import InventoryTracker from './components/InventoryTracker';
import AICopilot from './components/AICopilot';
import { Store, ShieldCheck } from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState('clear');
  const [incident, setIncident] = useState('none');

  // Compute dynamic AI alert banner
  let aiAlert = null;
  if (weather === 'rain' || weather === 'storm') {
    aiAlert = `Adverse weather detected (${weather}). Foot traffic estimated down by ${weather === 'storm' ? '75%' : '35%'}. AI has automatically reduced ingredient prep list to avoid waste.`;
  } else if (incident !== 'none') {
    aiAlert = `Road disruption reported (${incident}). Walk-in customer volume reduced. Supply chain routes dynamically rerouted.`;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-12">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-base">Orbyte Smart SME</h1>
              <p className="text-xs text-slate-400">AI Waste & Operations Management Challenge</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> System Online & Protected
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Scenario Simulator Control */}
        <ScenarioSimulator 
          weather={weather} 
          setWeather={setWeather} 
          incident={incident} 
          setIncident={setIncident} 
          aiAlert={aiAlert} 
        />

        {/* Dashboard Overview Cards */}
        <DashboardOverview weather={weather} incident={incident} />

        {/* Inventory & AI Copilot Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryTracker weather={weather} incident={incident} />
          <AICopilot weather={weather} incident={incident} />
        </div>
      </main>
    </div>
  );
}