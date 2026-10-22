import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, Zap, MapPin, RefreshCw } from 'lucide-react';

export default function ScenarioSimulator({ weather, setWeather, incident, setIncident, aiAlert }) {
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [coords, setCoords] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Automatically request geolocation on component mount
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
          // 1. Fetch live weather from free Open-Meteo API
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          const weatherCode = weatherData.current_weather?.weathercode ?? 0;

          // Map WMO Weather Codes (WMO: 51-67 Rain, 80-82 Showers, 95-99 Thunderstorm)
          if (weatherCode >= 95) {
            setWeather('storm');
          } else if (weatherCode >= 51) {
            setWeather('rain');
          } else {
            setWeather('clear');
          }

          // Reverse geocode to get city name (Nominatim OpenStreetMap API)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.suburb || 'Your Local Store Area';
          setLocationName(city);

          // 2. Simulated automatic traffic / incident detector based on time/location
          const currentHour = new Date().getHours();
          if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
            setIncident('accident'); // Peak hour delay simulation
          } else {
            setIncident('none');
          }

        } catch (err) {
          console.error('Error fetching live location data:', err);
          setLocationName('Location detected (API error fallback)');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation denied or failed:', error.message);
        setLocationName('Location Access Denied');
        setManualMode(true);
        setLoading(false);
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" />
            AI Autonomous Location & Operations Hub
          </h2>
          <p className="text-sm text-slate-500">
            Automatically monitoring micro-weather and traffic conditions around your physical store location.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUserLocationAndData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Refresh Geo Scan'}
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Auto Monitoring
          </div>
        </div>
      </div>

      {/* Detected Location Status Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Current Store Location</p>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {locationName}
              {coords && (
                <span className="text-xs font-normal text-slate-400">
                  ({coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°)
                </span>
              )}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <CloudRain className="w-4 h-4 text-blue-500" />
            Weather: <strong className="capitalize text-slate-800">{weather}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Traffic: <strong className="capitalize text-slate-800">{incident}</strong>
          </span>
        </div>
      </div>

      {/* Optional Manual Fallback Toggle */}
      <div className="text-right mb-2">
        <button
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-indigo-600 hover:underline font-medium"
        >
          {manualMode ? 'Hide Manual Simulation Controls' : 'Show Manual Override Controls'}
        </button>
      </div>

      {manualMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" /> Manual Weather Override
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

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Manual Incident Override
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
      )}

      {/* AI Intervention Banner */}
      {aiAlert && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
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