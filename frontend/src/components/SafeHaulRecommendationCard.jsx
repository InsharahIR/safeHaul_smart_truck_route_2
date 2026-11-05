import React from 'react';
import { Trophy, Sparkles, Check, Clock, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export default function SafeHaulRecommendationCard({
  route,
  onOpenDetails,
}) {
  if (!route) return <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 h-full flex items-center justify-center text-sm text-gray-500">Plan a trip to see route recommendations.</div>;
  const currentRoute = route;

  const riskBadgeColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'severe':
      case 'no travel':
        return 'bg-red-600 text-white border-red-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Route Recommendation
            </h2>
          </div>
          <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
        </div>

        {/* Featured Best Route Green Box */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 mb-5 ${currentRoute.weather_available ? 'bg-emerald-50/80 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md shrink-0 ${currentRoute.weather_available ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-slate-500 shadow-slate-500/20'}`}>
            {currentRoute.weather_available
              ? <Check className="w-6 h-6 stroke-[3]" />
              : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">
              {currentRoute.weather_available ? 'Best Route' : 'Route Option'}
            </h3>
            <p className="text-xs text-gray-600 font-medium leading-snug">
              {currentRoute.recommendation_reason || 'Recommendation unavailable.'}
            </p>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3.5 mb-5">
          {/* ETA */}
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span>ETA</span>
            </div>
            <span className="text-base font-black text-gray-900">
              {currentRoute.eta_formatted || '—'}
            </span>
          </div>

          {/* Risk Level */}
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Risk Level</span>
            </div>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-black border ${riskBadgeColor(
                currentRoute.risk_summary?.dominant_risk || 'Unavailable'
              )}`}
            >
              {currentRoute.risk_summary?.dominant_risk || 'Unavailable'}
            </span>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Distance</span>
            </div>
            <span className="text-base font-black text-gray-900">
              {currentRoute.distance_miles?.toLocaleString() || '—'} mi
            </span>
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={() => onOpenDetails?.(currentRoute)}
        className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
