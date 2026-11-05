import React from 'react';
import { MapPin, Flag, Calendar, Weight, Search } from 'lucide-react';

export default function SafeHaulInputBar({
  origin,
  setOrigin,
  destination,
  setDestination,
  departureTime,
  setDepartureTime,
  loadWeight,
  setLoadWeight,
  onFindRoutes,
  loading,
}) {
  return (
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
        {/* 1. Origin */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/60 border border-gray-100 hover:border-blue-200 transition">
          <div className="text-[#2563EB] shrink-0">
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
              Origin
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. City, Country"
              className="w-full text-sm font-bold text-gray-900 bg-transparent border-0 p-0 focus:outline-hidden focus:ring-0 truncate"
            />
          </div>
        </div>

        {/* 2. Destination */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/60 border border-gray-100 hover:border-blue-200 transition">
          <div className="text-[#2563EB] shrink-0">
            <Flag className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. City, Country"
              className="w-full text-sm font-bold text-gray-900 bg-transparent border-0 p-0 focus:outline-hidden focus:ring-0 truncate"
            />
          </div>
        </div>

        {/* 3. Departure Date/Time */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/60 border border-gray-100 hover:border-blue-200 transition">
          <div className="text-[#2563EB] shrink-0">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
              Departure Date/Time
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full text-sm font-bold text-gray-900 bg-transparent border-0 p-0 focus:outline-hidden focus:ring-0 truncate"
            />
            <div className="text-[10px] text-gray-500">Your device time zone</div>
          </div>
        </div>

        {/* 4. Load Weight */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/60 border border-gray-100 hover:border-blue-200 transition">
          <div className="text-[#2563EB] shrink-0">
            <Weight className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
              Load Weight
            </label>
            <input
              type="range"
              min="1000"
              max="80000"
              step="500"
              value={loadWeight}
              onChange={(e) => setLoadWeight(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="text-xs font-bold">{Number(loadWeight).toLocaleString()} lb</div>
          </div>
        </div>

        {/* 5. CTA Button: Find Routes */}
        <button
          onClick={onFindRoutes}
          disabled={loading}
          className="h-12 flex items-center justify-center gap-2 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Find Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
