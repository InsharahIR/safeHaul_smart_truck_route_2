import React, { useState } from 'react';
import SafeHaulSidebar from './components/SafeHaulSidebar';
import SafeHaulHeader from './components/SafeHaulHeader';
import SafeHaulInputBar from './components/SafeHaulInputBar';
import SafeHaulMapCard from './components/SafeHaulMapCard';
import SafeHaulRecommendationCard from './components/SafeHaulRecommendationCard';
import SafeHaulRouteCards from './components/SafeHaulRouteCards';
import SafeHaulWeatherSliderCard from './components/SafeHaulWeatherSliderCard';
import SafeHaulDetailsModal from './components/SafeHaulDetailsModal';
import RiskRulesModal from './components/RiskRulesModal';
import { planRoute } from './services/api';
const initialDeparture = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}`;
};

export default function App() {
  // Mobile Sidebar Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Input States (Matching reference image)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState(initialDeparture);
  const [loadWeight, setLoadWeight] = useState(35000);
  const [sampleInterval, setSampleInterval] = useState(25);

  // App Routing States
  const [routes, setRoutes] = useState([]);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [forecastHour, setForecastHour] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tripLabels, setTripLabels] = useState({ origin: '', dest: '' });

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedModalRoute, setSelectedModalRoute] = useState(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Find / calculate routes
  const handleFindRoutes = async (intervalOverride) => {
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both origin and destination.');
      return false;
    }
    const departure = new Date(departureTime);
    if (!departureTime || Number.isNaN(departure.getTime())) {
      setError('Please choose a valid departure date and time.');
      return false;
    }
    setLoading(true);
    setError('');
    try {
      const data = await planRoute({
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime: departure.toISOString(),
        loadWeightLbs: loadWeight,
        sampleIntervalMiles: typeof intervalOverride === 'number' ? intervalOverride : sampleInterval,
      });

      const inspectedRouteId = selectedModalRoute?.route_id;
      setRoutes(data.routes);
      setError(data.weather_available === false
        ? 'Weather service unavailable: risk scores and route safety recommendations are not based on current weather.'
        : '');
      const rec = data.routes.find((r) => r.is_recommended) || data.routes[0];
      setActiveRouteId(rec.route_id);
      setSelectedModalRoute(data.routes.find((r) => r.route_id === inspectedRouteId) || rec);
      setForecastHour(0);
      setTripLabels({
        origin: (data.origin?.display_name || origin).split(',')[0],
        dest: (data.destination?.display_name || destination).split(',')[0],
      });
      return true;
    } catch (err) {
      console.warn('Route planning failed:', err.message);
      // Keep the previous routes on screen and tell the user what went wrong
      setError(err.message || 'Could not plan route.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Re-run planning when checkpoint interval is changed from the details modal
  // Open Checkpoint Details Modal
  const handleOpenDetails = (routeToInspect) => {
    const targetRoute = routeToInspect || routes.find((r) => r.route_id === activeRouteId) || routes[0];
    setSelectedModalRoute(targetRoute);
    setIsDetailsModalOpen(true);
  };

  const activeRoute = routes.find((r) => r.route_id === activeRouteId) || routes[0] || null;
  const recommendedRoute = routes.find((r) => r.is_recommended) || routes[0] || null;

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-gray-900 flex font-sans antialiased">
      {/* 1. Left Sidebar: Matching Image 3 exactly */}
      <SafeHaulSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRules={() => setIsRulesModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 min-w-0 flex flex-col px-3 sm:px-5 lg:px-6 py-2 sm:py-3 max-w-[1550px] mx-auto w-full space-y-3.5">
        {/* Top Header: Driver Pro profile removed per user instruction */}
        <SafeHaulHeader
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Input Bar */}
        <SafeHaulInputBar
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          departureTime={departureTime}
          setDepartureTime={setDepartureTime}
          loadWeight={loadWeight}
          setLoadWeight={setLoadWeight}
          onFindRoutes={() => handleFindRoutes()}
          loading={loading}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {/* Middle Row: Map Card (8 cols) + Route Recommendation Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          <div className="lg:col-span-8">
            <SafeHaulMapCard
              routes={routes}
              activeRouteId={activeRouteId}
              originName={tripLabels.origin}
              destName={tripLabels.dest}
              forecastHour={forecastHour}
              setForecastHour={setForecastHour}
            />
          </div>

          <div className="lg:col-span-4">
            <SafeHaulRecommendationCard
              route={recommendedRoute}
              onOpenDetails={handleOpenDetails}
            />
          </div>
        </div>

        {/* Bottom Row: 3 Route Cards (8 cols) + Weather Forecast Along Route (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          <div id="routes-section" className="lg:col-span-8">
            <SafeHaulRouteCards
              routes={routes}
              activeRouteId={activeRouteId}
              onSelectRoute={(id) => setActiveRouteId(id)}
              onOpenDetails={handleOpenDetails}
            />
          </div>

          <div id="weather-section" className="lg:col-span-4">
            <SafeHaulWeatherSliderCard
              forecastHour={forecastHour}
              setForecastHour={setForecastHour}
              hourlyForecasts={activeRoute?.hourly_forecasts}
            />
          </div>
        </div>
      </main>

      {/* Checkpoint Details Modal (Every 10 / 25 / 50 miles, Wind, Rain, Snow, Load Rules) */}
        <SafeHaulDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        route={selectedModalRoute || activeRoute}
        loadWeight={loadWeight}
        sampleInterval={sampleInterval}
        onIntervalChange={async (newInterval) => {
          const updated = await handleFindRoutes(newInterval);
          if (updated) setSampleInterval(newInterval);
          return updated;
        }}
      />

      {/* Risk Rules Reference Modal */}
      <RiskRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

    </div>
  );
}
