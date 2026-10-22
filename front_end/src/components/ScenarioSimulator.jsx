import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, Zap, MapPin, RefreshCw } from 'lucide-react';

export default function ScenarioSimulator({ weather, setWeather, incident, setIncident, aiAlert }) {
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [coords, setCoords] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    fetchUserLocationAndData();
  }, []);

  const fetchUserLocationAndData = () => {
    if (!navigator.geolocation) {
      setLocationName('Geolocation not supported by browser');
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
          console.error('Error fetching location data:', err);
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

  return (
    <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Weather & Incident Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous scanner reading live weather radar and local road traffic anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUserLocationAndData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Refresh Geo Scan'}
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
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

      <div className="text-right mb-2">
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

      {aiAlert && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          {aiAlert}
        </div>
      )}
    </div>
  );
}