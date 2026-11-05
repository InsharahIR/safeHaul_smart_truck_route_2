import React from 'react';
import { CloudSun, Sun, Cloud, CloudRain } from 'lucide-react';

export default function SafeHaulWeatherSliderCard({
  forecastHour,
  setForecastHour,
  hourlyForecasts,
}) {
  const items = (hourlyForecasts && hourlyForecasts.length > 0)
    ? hourlyForecasts.map((f, i) => ({
        label: f.label || (i === 0 ? 'Now' : `${i * 12}h`),
        hour: f.hour ?? i * 12,
        temp_f: f.available ? f.temp_f : null,
        icon: f.icon || 'sun',
      }))
    : [0, 12, 24, 36, 48].map((hour) => ({ label: hour ? `${hour}h` : 'Now', hour, temp_f: null, available: false }));

  const renderWeatherIcon = (type) => {
    switch (type) {
      case 'rain':
      case 'cloud-rain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'cloud-sun':
        return <CloudSun className="w-5 h-5 text-amber-500" />;
      case 'sun':
      default:
        return <Sun className="w-5 h-5 text-amber-500 fill-amber-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[#2563EB]">
          <CloudSun className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Weather Forecast Along Route
        </h2>
      </div>

      {/* Slider Area */}
      <div className="my-2">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="48"
            step="1"
            value={forecastHour}
            onChange={(e) => setForecastHour(Number(e.target.value))}
            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
          />
        </div>
        {/* Ticks */}
        <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-1.5 px-0.5">
          <span>0h</span>
          <span>12h</span>
          <span>24h</span>
          <span>36h</span>
          <span>48h</span>
        </div>
      </div>

      {/* 5 Snapshot Cards */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {items.map((item, idx) => {
          const isSelected = Math.abs(forecastHour - item.hour) <= 6;
          return (
            <div
              key={idx}
              onClick={() => setForecastHour(item.hour)}
              className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 ring-1 ring-[#2563EB] shadow-xs'
                  : 'bg-gray-50/60 hover:bg-gray-100/70'
              }`}
            >
              <span className="text-[11px] font-bold text-gray-500">
                {item.label}
              </span>
              <div className="my-0.5">
                {item.temp_f == null ? <span className="text-gray-400 text-xs">—</span> : renderWeatherIcon(item.icon)}
              </div>
              <span className="text-xs font-black text-gray-900">
                {item.temp_f == null ? 'N/A' : `${item.temp_f}°F`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
