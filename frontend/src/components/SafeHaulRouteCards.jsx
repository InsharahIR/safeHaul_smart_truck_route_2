import React from 'react';
import { Clock, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export default function SafeHaulRouteCards({
  routes,
  activeRouteId,
  onSelectRoute,
  onOpenDetails,
}) {
  if (!routes?.length) return <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center text-sm text-gray-500">Available driving routes will appear here after you plan a trip.</div>;
  const riskBadgeStyle = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'severe':
      case 'no travel':
        return 'bg-red-600 text-white border-red-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {routes.map((route, idx) => {
        const isSelected = route.route_id === activeRouteId;
        const isRec = route.weather_available && (route.is_recommended || idx === 0);

        return (
          <div
            key={route.route_id}
            onClick={() => onSelectRoute(route.route_id)}
            className={`rounded-2xl p-4 bg-white transition duration-200 cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'ring-2 ring-[#2563EB] shadow-md bg-blue-50/15'
                : 'border border-gray-100 hover:border-gray-200 shadow-xs'
            }`}
          >
            <div>
              {/* Top Header: Radio + Title + Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Custom Radio Button */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <span className="text-sm font-black text-gray-900">
                    {route.name || `Route ${idx + 1}`}
                  </span>
                </div>

                {isRec && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    Recommended
                  </span>
                )}
              </div>

              <div className="my-2 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs font-semibold text-gray-600">{route.via_summary || route.summary || 'Driving route'}</div>

              {/* Metrics Rows */}
              <div className="space-y-1.5 text-xs font-semibold text-gray-600 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>ETA</span>
                  </div>
                  <span className="font-black text-gray-900">
                    {route.eta_formatted || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Risk Level</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadgeStyle(
                      route.risk_summary?.dominant_risk || 'Unavailable'
                    )}`}
                  >
                    {route.risk_summary?.dominant_risk || 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Distance</span>
                  </div>
                  <span className="font-black text-gray-900">
                    {route.distance_miles?.toLocaleString() || '—'} mi
                  </span>
                </div>
              </div>
            </div>

            {/* View Details Link */}
            <div className="pt-3 mt-2 border-t border-gray-100 flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(route);
                }}
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
