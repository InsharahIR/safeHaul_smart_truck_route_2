import React from 'react';
import { ShieldCheck, Bell, Menu } from 'lucide-react';

export default function SafeHaulHeader({ onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between gap-4 py-2">
      {/* Left: Mobile Toggle, Shield Icon & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleSidebar}
          aria-label="Open Navigation"
          className="lg:hidden p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 shadow-xs border border-gray-200 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Blue Shield Check Icon */}
        <div className="w-11 h-11 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Smart Truck Route Planning
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Choose the safest route based on weather, load weight, and travel time.
          </p>
        </div>
      </div>

      {/* Right: Bell icon ONLY — Driver Pro removed completely */}
      <button
        aria-label="Notifications"
        className="relative p-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-100 shadow-xs text-gray-600 hover:text-gray-900 transition shrink-0"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>
    </header>
  );
}
