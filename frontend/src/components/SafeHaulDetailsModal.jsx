import React, { useState } from 'react';
import { X, ShieldAlert, Clock, MapPin, Wind, CloudRain, Snowflake } from 'lucide-react';

export default function SafeHaulDetailsModal({
  isOpen,
  onClose,
  route,
  loadWeight = 35000,
  sampleInterval = 25,
  onIntervalChange,
}) {
  const selectedInterval = sampleInterval;
  const [updatingInterval, setUpdatingInterval] = useState(false);

  if (!isOpen || !route) return null;

  const checkpoints = route.checkpoints || [];

  // Filter or sample checkpoints based on selected interval if needed
  const displayCheckpoints = checkpoints;

  const riskBadgeStyle = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'no travel':
        return 'bg-red-600 text-white border-red-700 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-500 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  {route.name || 'Route Details'} — Checkpoints & Risk Breakdown
                </h2>
                {route.is_recommended && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {route.summary || 'Corridor Analysis'} • Total Distance: {route.distance_miles} mi • Total ETA: {route.eta_formatted}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Info Banner: Load Rules & Weather Sensitivity */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                Active Load Weight & Safety Evaluation
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">
                Current Load: {loadWeight.toLocaleString()} lb {loadWeight > 30000 && '(Heavy Haul Risk Adjusted)'}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                • Wind ≥55 mph = No Travel &nbsp;|&nbsp; • Wind 45-54 mph + &gt;30,000 lb = No Travel &nbsp;|&nbsp; • Wind 35-44 mph + &gt;40,000 lb = Severe
              </div>
            </div>

            {/* Interval Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">Interval:</span>
              <div className="inline-flex rounded-xl p-1 bg-white border border-gray-200">
                {[10, 25, 50].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => {
                      if (updatingInterval || interval === selectedInterval) return;
                      setUpdatingInterval(true);
                      Promise.resolve(onIntervalChange?.(interval)).finally(() => setUpdatingInterval(false));
                    }}
                    disabled={updatingInterval}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                      selectedInterval === interval
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {interval} mi
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkpoint Details Table */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>Route Checkpoint Schedule (Every {selectedInterval} Miles)</span>
            </h3>

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-100 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Checkpoint</th>
                      <th className="py-3 px-4">Mileage</th>
                      <th className="py-3 px-4">Arrival ETA</th>
                      <th className="py-3 px-4">Wind</th>
                      <th className="py-3 px-4">Rain</th>
                      <th className="py-3 px-4">Snow</th>
                      <th className="py-3 px-4 text-center">Load-Adjusted Risk</th>
                      <th className="py-3 px-4">Load Rule Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {displayCheckpoints.map((cp, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span>{cp.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-bold">
                          {cp.mileage} mi
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-extrabold">
                          {cp.eta}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="font-bold">{cp.wind_mph ?? 'N/A'}</span>{cp.wind_mph == null ? '' : ' mph'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="font-bold">{cp.rain_in_hr ?? 'N/A'}</span>{cp.rain_in_hr == null ? '' : ' in/hr'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="font-bold">{cp.snow_in_hr ?? 'N/A'}</span>{cp.snow_in_hr == null ? '' : ' in/hr'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border ${riskBadgeStyle(
                              cp.load_adjusted_risk || cp.risk_level
                            )}`}
                          >
                            {cp.load_adjusted_risk || cp.risk_level || 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 min-w-48">
                          {(cp.load_notes || []).join(' · ') || (cp.weather_available ? 'No load rule triggered' : 'Unavailable without weather data')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Risk Evaluation Matrix Reference (From PDF) */}
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              SafeHaul Official Risk Threshold Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-500" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-[11px] text-gray-600 space-y-0.5">
                  <div>&lt; 25 mph: <span className="text-emerald-600 font-bold">Low</span></div>
                  <div>25–34 mph: <span className="text-amber-600 font-bold">Moderate</span></div>
                  <div>35–44 mph: <span className="text-orange-600 font-bold">High</span></div>
                  <div>45–54 mph: <span className="text-rose-600 font-bold">Severe</span></div>
                  <div>≥ 55 mph: <span className="text-red-700 font-bold">No Travel</span></div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  <span>Rain Rate</span>
                </div>
                <div className="text-[11px] text-gray-600 space-y-0.5">
                  <div>&lt; 0.10 in/hr: <span className="text-emerald-600 font-bold">Low</span></div>
                  <div>0.10–0.25 in/hr: <span className="text-amber-600 font-bold">Moderate</span></div>
                  <div>0.25–0.50 in/hr: <span className="text-orange-600 font-bold">High</span></div>
                  <div>0.50–1.00 in/hr: <span className="text-rose-600 font-bold">Severe</span></div>
                  <div>&gt; 1.00 in/hr: <span className="text-red-700 font-bold">No Travel</span></div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                  <span>Snow Rate</span>
                </div>
                <div className="text-[11px] text-gray-600 space-y-0.5">
                  <div>&lt; 0.5 in/hr: <span className="text-emerald-600 font-bold">Low</span></div>
                  <div>0.5–1.0 in/hr: <span className="text-amber-600 font-bold">Moderate</span></div>
                  <div>1.0–2.0 in/hr: <span className="text-orange-600 font-bold">High</span></div>
                  <div>2.0–3.0 in/hr: <span className="text-rose-600 font-bold">Severe</span></div>
                  <div>&gt; 3.0 in/hr: <span className="text-red-700 font-bold">No Travel</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50/90 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
