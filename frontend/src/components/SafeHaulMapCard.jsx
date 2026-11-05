import React, { useEffect, useState } from 'react';
import { Layers, ChevronDown, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker asset references
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom origin marker matching reference image: Green pin + route label tag
const createOriginIcon = (label = 'Origin') =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="display:flex; align-items:center; gap:5px; pointer-events:auto;">
        <div style="background-color:#10B981; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
          <div style="width:7px; height:7px; background-color:white; border-radius:50%;"></div>
        </div>
        <span style="background-color:#0F172A; color:white; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.3); white-space:nowrap; letter-spacing:0.3px;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [11, 12],
  });

// Custom destination marker matching reference image: Red pin + route label tag
const createDestIcon = (label = 'Destination') =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="display:flex; align-items:center; gap:5px; pointer-events:auto;">
        <div style="background-color:#EF4444; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
          <div style="width:7px; height:7px; background-color:white; border-radius:50%;"></div>
        </div>
        <span style="background-color:#0F172A; color:white; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.3); white-space:nowrap; letter-spacing:0.3px;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [100, 24],
    iconAnchor: [11, 12],
  });

// Checkpoint circular dot icon
const createCheckpointDot = (risk = 'Low') => {
  let color = risk === 'Unavailable' ? '#64748B' : '#10B981'; // Gray when no forecast is available
  if (risk === 'Moderate') color = '#F59E0B'; // Amber
  if (risk === 'High') color = '#F97316'; // Orange
  if (risk === 'Severe' || risk === 'No Travel') color = '#DC2626'; // Red

  return L.divIcon({
    className: 'checkpoint-dot',
    html: `<div style="width:10px; height:10px; border-radius:50%; background-color:${color}; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
};

// Map controls overlay matching reference image
function MapControlsWrapper({ coordinates }) {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 z-400 flex flex-col gap-1.5 shadow-md">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center font-bold text-base border border-gray-200 transition shadow-xs cursor-pointer"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4 stroke-[2.2]" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center font-bold text-base border border-gray-200 transition shadow-xs cursor-pointer"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4 stroke-[2.2]" />
      </button>
      <button
        onClick={() => {
          if (coordinates && coordinates.length > 1) {
            map.fitBounds(L.latLngBounds(coordinates), { padding: [45, 45] });
          }
        }}
        className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center border border-gray-200 transition shadow-xs cursor-pointer"
        aria-label="Reset compass"
      >
        <Compass className="w-4 h-4 text-[#2563EB] stroke-[2.2]" />
      </button>
    </div>
  );
}

// Auto fit corridor
function FitCorridor({ coordinates, fitKey }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [45, 45] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

export default function SafeHaulMapCard({
  routes = [],
  activeRouteId = 'route_1',
  originName = 'Origin',
  destName = 'Destination',
  forecastHour = 0,
  setForecastHour,
}) {
  const [showRadar, setShowRadar] = useState(true);

  const activeRoute = routes.find((r) => r.route_id === activeRouteId) || routes[0] || {};
  const alternativeRoutes = routes.filter((r) => r.route_id !== activeRouteId);

  const activeCoordinates = activeRoute?.coordinates || [];
  // Changes whenever the trip (start/end/length) changes -> map re-fits
  const fitKey = `${activeRoute?.route_id}|${activeCoordinates.length}|${activeCoordinates[0]?.join(',')}|${activeCoordinates[activeCoordinates.length - 1]?.join(',')}`;
  const timelinePoints = activeRoute?.corridor_timeline?.[forecastHour] || null;
  const forecastTimeWindow = forecastHour === 0
    ? 'Current Forecast'
    : forecastHour === 24
      ? 'Next 24 Hours'
      : forecastHour === 48
        ? 'Next 48 Hours'
        : 'Custom Timeline';

  const originCoord = activeCoordinates[0];
  const destCoord = activeCoordinates[activeCoordinates.length - 1];
  const checkpoints = activeRoute?.checkpoints || [];

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 h-[360px] sm:h-[400px] lg:h-[420px]">
      {!activeCoordinates.length && <div className="absolute inset-0 z-100 flex items-center justify-center pointer-events-none"><div className="rounded-xl bg-white/95 border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 shadow">Plan a trip to view its route and forecast.</div></div>}
      {activeCoordinates.length > 1 && !activeRoute.weather_available && <div className="absolute bottom-3 left-3 z-400 rounded-xl bg-white/95 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 shadow pointer-events-none">Forecast unavailable for some or all checkpoints; risk is uncalculated where data is missing.</div>}
      {/* 1. Top Overlaid Action Toolbar matching Image 3 */}
      {activeCoordinates.length > 1 && <div className="absolute top-3 left-3 right-3 z-400 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Pills */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Weather Heatmap Toggle Button */}
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm backdrop-blur-md cursor-pointer ${
              showRadar
                ? 'bg-white/95 text-gray-900 border border-gray-200'
                : 'bg-gray-100/90 text-gray-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#2563EB] stroke-[2.2]" />
            <span>Weather Heatmap</span>
          </button>

          {/* Time Window Dropdown */}
          <div className="relative">
            <select
              value={forecastTimeWindow}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'Current Forecast') setForecastHour?.(0);
                if (value === 'Next 24 Hours') setForecastHour?.(24);
                if (value === 'Next 48 Hours') setForecastHour?.(48);
              }}
              className="appearance-none bg-white/95 text-gray-900 text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border border-gray-200 shadow-sm backdrop-blur-md cursor-pointer focus:outline-hidden"
            >
              <option value="Custom Timeline" disabled>Custom Timeline</option>
              <option value="Next 48 Hours">Next 48 Hours</option>
              <option value="Next 24 Hours">Next 24 Hours</option>
              <option value="Current Forecast">Current Forecast</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Right Risk Legend Pill */}
        {activeRoute.weather_available && <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/95 text-gray-800 text-[11px] font-bold border border-gray-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Severe</span>
          </div>
        </div>}
      </div>}

      {/* 2. Leaflet Map */}
      <MapContainer
        center={activeCoordinates[0] || [39, -98]}
        zoom={activeCoordinates.length > 1 ? 6 : 4}
        scrollWheelZoom={false}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <FitCorridor coordinates={activeCoordinates} fitKey={fitKey} />
        <MapControlsWrapper coordinates={activeCoordinates} />

        {/* Free OpenStreetMap Tiles with Zero Watermarks */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Alternative Route 2 (Dark Gray Line) */}
        {alternativeRoutes.length > 0 && alternativeRoutes[0] && (
          <Polyline
            positions={alternativeRoutes[0].coordinates || []}
            pathOptions={{
              color: '#334155',
              weight: 4,
              opacity: 0.85,
            }}
          />
        )}

        {/* Alternative Route 3 (Light Gray Line) */}
        {alternativeRoutes.length > 1 && alternativeRoutes[1] && (
          <Polyline
            positions={alternativeRoutes[1].coordinates || []}
            pathOptions={{
              color: '#94A3B8',
              weight: 3.5,
              opacity: 0.85,
            }}
          />
        )}

        {/* Active Route 1 (Bold Royal Blue Line matching Image 3) */}
        <Polyline
          positions={activeCoordinates}
          pathOptions={{
            color: '#2563EB',
            weight: 5.5,
            opacity: 0.95,
          }}
        />

        {/* Forecast risk colors follow the selected corridor hour and remain visible above the base route. */}
        {showRadar && timelinePoints && timelinePoints.slice(0, -1).map((pt, i) => {
          const next = timelinePoints[i + 1];
          if (!pt.weather_available || !next?.weather_available) return null;
          return <Polyline key={`wx-${i}`} positions={[[pt.lat, pt.lon], [next.lat, next.lon]]}
            pathOptions={{ color: pt.color, weight: 14, opacity: 0.9, lineCap: 'round' }} />;
        })}

        {/* Checkpoint Dots on Active Route */}
        {checkpoints.map((cp, idx) => {
          const coord = cp.coordinates || activeCoordinates[Math.min(idx * 2 + 1, activeCoordinates.length - 2)];
          if (!coord) return null;
          return (
            <Marker
              key={idx}
              position={coord}
              icon={createCheckpointDot(cp.risk_level || cp.load_adjusted_risk)}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold text-gray-900">{cp.name}</div>
                  <div className="text-gray-500">Mile {cp.mileage} • ETA: {cp.eta}</div>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-gray-700">
                    <span>Wind: {cp.weather_available ? `${cp.wind_mph} mph` : 'N/A'}</span>
                    <span>Rain: {cp.weather_available ? `${cp.rain_in_hr} in/hr` : 'N/A'}</span>
                  </div>
                  <div className="mt-1 text-gray-700">Snow: {cp.weather_available ? `${cp.snow_in_hr} in/hr` : 'N/A'}</div>
                  {(cp.load_notes || []).length > 0 && <div className="mt-1 text-gray-600">{cp.load_notes.join(' · ')}</div>}
                  <div className="mt-1 font-bold text-blue-600">
                    {cp.weather_available ? `Risk: ${cp.load_adjusted_risk || cp.risk_level}` : 'Weather data unavailable — risk not calculated'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Origin Marker (Green Pin with "New York" tag) */}
        {originCoord && <Marker position={originCoord} icon={createOriginIcon(originName)} />}

        {/* Destination Marker (Red Pin with "Chicago" tag) */}
        {destCoord && <Marker position={destCoord} icon={createDestIcon(destName)} />}
      </MapContainer>
    </div>
  );
}
