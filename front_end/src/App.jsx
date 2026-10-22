import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Package,
  Bot,
  Sparkles,
  DollarSign,
  Calendar,
  ShieldAlert,
  CloudRain,
  AlertTriangle,
  Zap,
  RefreshCw,
  Check,
  Edit3,
  MessageSquare,
  Send,
  User,
  PackageCheck,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState('clear');
  const [incident, setIncident] = useState('none');
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [coords, setCoords] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Smart Inventory State
  const [isApproved, setIsApproved] = useState(true);
  const [inventoryItems] = useState([
    { id: 1, name: 'Fresh Dairy & Milk (Liters)', normal: 50, unit: 'L' },
    { id: 2, name: 'Pre-prepared Bakery Buns', normal: 120, unit: 'pcs' },
    { id: 3, name: 'Fresh Salad Greens', normal: 40, unit: 'packs' },
    { id: 4, name: 'Raw Gourmet Meat', normal: 30, unit: 'kg' },
  ]);

  const discountFactor = (weather !== 'clear' ? 0.35 : 0) + (incident !== 'none' ? 0.20 : 0);
  const [customQtys, setCustomQtys] = useState({ 1: 50, 2: 120, 3: 40, 4: 30 });

  // AI Copilot Messages State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Orbyte AI Copilot. Ask me how today’s weather or road status impacts your inventory!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch Location & Weather
  useEffect(() => {
    fetchUserLocationAndData();
  }, []);

  const fetchUserLocationAndData = () => {
    if (!navigator.geolocation) {
      setLocationName('Geolocation not supported');
      setManualMode(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          const weatherCode = weatherData.current_weather?.weathercode ?? 0;

          if (weatherCode >= 95) setWeather('storm');
          else if (weatherCode >= 51) setWeather('rain');
          else setWeather('clear');

          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.suburb || 'Local Store Area';
          setLocationName(city);

          const currentHour = new Date().getHours();
          if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
            setIncident('accident');
          } else {
            setIncident('none');
          }
        } catch (err) {
          console.error(err);
          setLocationName('Location detected');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationName('Location Access Denied');
        setManualMode(true);
        setLoading(false);
      }
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botReply = "Everything looks stable for your SME operations today!";
      const query = userMsg.toLowerCase();

      if (query.includes('weather') || query.includes('rain') || query.includes('storm')) {
        botReply = weather === 'clear'
          ? "Weather is clear and optimal for normal business flow."
          : `Current weather alert is active (${weather}). Foot traffic is predicted to drop significantly.`;
      } else if (query.includes('accident') || query.includes('traffic')) {
        botReply = incident === 'none'
          ? "No major road accidents reported near your store."
          : "A nearby road incident is causing traffic delays.";
      } else if (query.includes('waste') || query.includes('save')) {
        botReply = "Following AI recommendations helps prevent overstock and saves up to ~$5,200 monthly!";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'weather', label: 'Weather & Incident Map', icon: MapPin },
    { id: 'inventory', label: 'Smart Inventory', icon: Package },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'Live' },
  ];

  const isRisky = weather !== 'clear' || incident !== 'none';

  return (
    <div className="flex min-h-screen bg-[#060b17] text-slate-100 font-sans">
      {/* LEFT SIDEBAR NAV */}
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Orbyte AI</h1>
              <p className="text-xs text-cyan-400 font-medium">Smart SME Operations</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/60 px-2 text-xs text-slate-500">
          Orbyte OS v2.4 • Active Monitoring
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* PAGE 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
              <p className="text-xs text-slate-400">Real-time business performance & footfall tracking.</p>
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
        )}

        {/* PAGE 2: WEATHER & INCIDENT MAP */}
        {activeTab === 'weather' && (
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-cyan-400" /> Weather & Incident Map
                </h2>
                <p className="text-xs text-slate-400 mt-1">Autonomous scanner reading live weather radar and traffic anomalies.</p>
              </div>
              <button
                onClick={fetchUserLocationAndData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Scanning...' : 'Refresh Geo Scan'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Store Geo Node</p>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {locationName}
                    {coords && (
                      <span className="text-xs font-normal text-slate-500">
                        ({coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°)
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  Weather: <strong className="capitalize text-white">{weather}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Traffic: <strong className="capitalize text-white">{incident}</strong>
                </span>
              </div>
            </div>

            <div className="text-right">
              <button onClick={() => setManualMode(!manualMode)} className="text-xs text-cyan-400 hover:underline">
                {manualMode ? 'Hide Simulation Override' : 'Show Manual Override Controls'}
              </button>
            </div>

            {manualMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Weather Override</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="clear">☀️ Clear & Sunny (Normal)</option>
                    <option value="rain">🌧️ Heavy Rain / Thunderstorm</option>
                    <option value="storm">⚡ Severe Typhoon</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Traffic Override</label>
                  <select
                    value={incident}
                    onChange={(e) => setIncident(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="none">✅ Normal Traffic</option>
                    <option value="accident">🚧 Road Accident Nearby</option>
                    <option value="construction">🏗️ Construction Blockage</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 3: SMART INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  {inventoryItems.map((item) => {
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
        )}

        {/* PAGE 4: AI COPILOT */}
        {activeTab === 'copilot' && (
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                AI Copilot & Operations Advisor
              </h3>
              <p className="text-xs text-slate-400">Direct conversational assistant for real-time risk mitigation.</p>
            </div>

            <div className="h-[420px] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${m.sender === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 border border-slate-700'}`}>
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI about traffic, weather impact, or stock..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition">
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}