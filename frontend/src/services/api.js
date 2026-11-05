/**
 * SafeHaul API Client
 * Talks to the Django API (Render / localhost:8000).
 * Backend response is normalized into the shape the UI components expect.
 * Errors propagate to the app so a route change either loads backend data or shows a clear error.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : '/api');

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health/`, { method: 'GET' });
    if (res.ok) return await res.json();
    return { status: 'offline' };
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function geocodeSearch(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/geocode/?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn('Geocode API request failed:', err.message);
  }
  return [];
}

const RISK_ORDER = ['Low', 'Moderate', 'High', 'Severe', 'No Travel'];

function dominantRisk(route) {
  if (!route.weather_available) return 'Unavailable';
  const avg = route.average_risk_score ?? 1;
  if ((route.severe_and_no_travel_miles || 0) > 0 && avg >= 3) return 'Severe';
  if (avg < 1.5) return 'Low';
  if (avg < 2.5) return 'Moderate';
  if (avg < 3.5) return 'High';
  return 'Severe';
}

// Keep the polyline light for Leaflet (thousands of points are not needed visually)
function downsample(points, max = 700) {
  if (points.length <= max) return points;
  const step = points.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)]);
  out.push(points[points.length - 1]);
  return out;
}

export function normalizeRoute(r) {
  // Preserve routes that are already in the UI's normalized shape.
  if (r.coordinates) return r;

  const geometry = r.geometry || [];
  const coordinates = downsample(geometry.map(([lon, lat]) => [lat, lon]));

  const checkpoints = (r.checkpoints || []).map((cp) => {
    return {
      ...cp,
      name: cp.name,
      mileage: cp.distance_from_origin_miles,
      eta: cp.eta_formatted,
      wind_mph: cp.weather?.wind_mph ?? null,
      rain_in_hr: cp.weather?.rain_in_per_hr ?? null,
      snow_in_hr: cp.weather?.snow_in_per_hr ?? null,
      temperature_f: cp.weather?.temperature_f ?? null,
      weather_available: Boolean(cp.weather),
      load_notes: cp.risk?.load_notes || [],
      risk_level: cp.risk?.overall_risk || 'Unavailable',
      load_adjusted_risk: cp.risk?.overall_risk || 'Unavailable',
      coordinates: [cp.latitude, cp.longitude],
    };
  });

  return {
    ...r,
    summary: r.via_summary,
    weather_available: Boolean(r.weather_available),
    eta_formatted: r.duration_text,
    coordinates,
    checkpoints,
    hourly_forecasts: [0, 12, 24, 36, 48].map((hour) => {
      const points = (r.corridor_timeline?.[hour] || []).filter((point) => point.weather_available && Number.isFinite(point.temperature_f));
      if (!points.length) return { label: hour ? `${hour}h` : 'Now', hour, available: false };
      const temp = points.reduce((sum, point) => sum + point.temperature_f, 0) / points.length;
      const rain = points.some((point) => point.rain_in > 0.01);
      return { label: hour ? `${hour}h` : 'Now', hour, available: true, temp_f: Math.round(temp), icon: rain ? 'rain' : 'cloud' };
    }),
    risk_summary: {
      dominant_risk: dominantRisk(r),
      average_risk_score: r.average_risk_score,
      severe_miles: r.severe_and_no_travel_miles ?? null,
      high_miles: r.high_miles ?? null,
      moderate_miles: r.moderate_miles ?? null,
      low_miles: r.low_miles ?? null,
    },
  };
}

export async function planRoute(params) {
  const controller = new AbortController();
  // Backend calls OSRM + Open-Meteo, which can take a while for long routes
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${API_BASE_URL}/plan-route/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        departure_time: params.departureTime,
        load_weight_lbs: Number(params.loadWeightLbs || 35000),
        sample_interval_miles: Number(params.sampleIntervalMiles || 25),
      }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      throw new Error(data?.message || `Server error (${res.status})`);
    }
    if (!data || !data.routes || data.routes.length === 0) {
      throw new Error('No routes found for these locations.');
    }

    return { ...data, routes: data.routes.map(normalizeRoute) };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (err instanceof TypeError) {
      throw new Error('Cannot reach the backend server. Make sure it is running.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export { API_BASE_URL, RISK_ORDER };
