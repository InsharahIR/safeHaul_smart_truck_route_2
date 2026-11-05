import React from 'react';
import { LayoutDashboard, MapPin, Cloud, HelpCircle, X } from 'lucide-react';
import blueTruckLogo from '../assets/blue_truck_logo.png';
import sidebarTruckImg from '../assets/sidebar_truck.png';

export default function SafeHaulSidebar({
  isOpen,
  onClose,
  activeTab = 'dashboard',
  setActiveTab,
  onOpenRules,
}) {
  const scrollToRoutes = () => {
    const el = document.getElementById('routes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{ backgroundColor: '#131B2E' }}
        className={`fixed lg:sticky top-0 z-50 w-56 shrink-0 h-screen rounded-none text-white flex flex-col justify-between overflow-hidden shadow-xl border-r border-white/10 select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand with Blue Truck Logo */}
        <div className="pt-6 pb-2 px-5 flex flex-col items-center text-center relative">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Blue Truck Logo (Image 1 from user) */}
          <img
            src={blueTruckLogo}
            alt="SafeHaul Logo"
            className="w-16 h-16 rounded-2xl shadow-lg object-contain mb-2 ring-2 ring-blue-500/30"
          />

          <h1 className="text-xl font-black text-white tracking-tight leading-tight">
            SafeHaul
          </h1>
          <p className="text-xs text-blue-200/90 font-medium tracking-wide mt-0.5">
            Drive Safe. Deliver On Time.
          </p>
        </div>

        {/* Middle: Navigation Links (Evenly spaced & clean) */}
        <nav className="px-4 space-y-2 text-sm font-semibold my-auto">
          {/* Dashboard */}
          <div
            onClick={() => {
              setActiveTab?.('dashboard');
              onClose?.();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-600/35'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
            <span className="tracking-wide">Dashboard</span>
          </div>

          {/* Routes - scrolls to the 3 route cards section */}
          <div
            onClick={() => {
              setActiveTab?.('routes');
              onClose?.();
              scrollToRoutes();
            }}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'routes'
                ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-600/35'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <MapPin className="w-4 h-4 stroke-[2]" />
            <span className="tracking-wide">Routes</span>
          </div>

          {/* Weather */}
          <div
            onClick={() => {
              setActiveTab?.('weather');
              onClose?.();
              const el = document.getElementById('weather-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'weather'
                ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-600/35'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Cloud className="w-4 h-4 stroke-[2]" />
            <span className="tracking-wide">Weather</span>
          </div>

          {/* Help */}
          <div
            onClick={() => {
              onOpenRules?.();
              onClose?.();
            }}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 stroke-[2]" />
            <span className="tracking-wide">Help</span>
          </div>
        </nav>

        {/* Bottom: Truck on Highway (Fixed and visible) */}
        <div className="relative mt-auto w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#131B2E]/25 to-[#131B2E] pointer-events-none z-10" />
          <img
            src={sidebarTruckImg}
            alt="SafeHaul Highway Truck"
            className="w-full h-44 object-cover object-top select-none pointer-events-none block"
          />
        </div>
      </aside>
    </>
  );
}