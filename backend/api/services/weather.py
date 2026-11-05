"""Weather enrichment using only forecast values returned by Open-Meteo."""
from datetime import datetime, timedelta, timezone
from time import monotonic

import requests

from api.services.risk_calculator import evaluate_checkpoint, LEVEL_ORDER

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
MAX_LOCATIONS_PER_REQUEST = 250
WEATHER_CACHE_TTL_SECONDS = 300
_WEATHER_CACHE = {}


def fetch_weather_batch(coords: list[tuple[float, float]]) -> list[dict]:
    """Fetch multiple locations per request and preserve the input ordering."""
    if not coords:
        return []

    now = monotonic()
    results = []
    for start in range(0, len(coords), MAX_LOCATIONS_PER_REQUEST):
        chunk = coords[start:start + MAX_LOCATIONS_PER_REQUEST]
        cache_key = tuple((round(lat, 4), round(lon, 4)) for lat, lon in chunk)
        cached = _WEATHER_CACHE.get(cache_key)
        if cached and now - cached[0] < WEATHER_CACHE_TTL_SECONDS:
            results.extend(cached[1])
            continue

        params = {
            'latitude': ",".join(f"{lat:.4f}" for lat, _ in chunk),
            'longitude': ",".join(f"{lon:.4f}" for _, lon in chunk),
            'hourly': 'wind_speed_10m,rain,snowfall,temperature_2m',
            'temperature_unit': 'fahrenheit',
            'wind_speed_unit': 'mph',
            'precipitation_unit': 'inch',
            'forecast_days': 3,
            'timezone': 'UTC',
        }
        try:
            response = requests.get(OPEN_METEO_BASE, params=params, timeout=20)
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, (dict, list)):
                raise ValueError('Weather service returned an invalid response')
            batch = payload if isinstance(payload, list) else [payload]
            batch = [item if isinstance(item, dict) else {'weather_error': 'Weather response was incomplete'}
                     for item in batch]
            if len(batch) != len(chunk):
                batch = batch[:len(chunk)] + [{'weather_error': 'Weather response was incomplete'}] * max(0, len(chunk) - len(batch))
            if all(not item.get('weather_error') for item in batch):
                _WEATHER_CACHE[cache_key] = (now, batch)
            results.extend(batch)
        except (requests.RequestException, ValueError) as exc:
            print(f"Open-Meteo error: {exc}")
            results.extend([{'weather_error': 'Weather service is unavailable'}] * len(chunk))

    # Bound process memory when a service handles many distinct trips.
    if len(_WEATHER_CACHE) > 128:
        expired = [key for key, (cached_at, _) in _WEATHER_CACHE.items()
                   if now - cached_at >= WEATHER_CACHE_TTL_SECONDS]
        for key in expired:
            _WEATHER_CACHE.pop(key, None)
        while len(_WEATHER_CACHE) > 128:
            _WEATHER_CACHE.pop(next(iter(_WEATHER_CACHE)))
    return results


def get_closest_hour_index(time_list: list[str], target_dt: datetime) -> int | None:
    """Compare forecast timestamps and arrival ETAs on an aware UTC timeline."""
    if not time_list:
        return 0
    target_utc = target_dt.replace(tzinfo=timezone.utc) if target_dt.tzinfo is None else target_dt.astimezone(timezone.utc)
    parsed = [datetime.fromisoformat(value.replace('Z', '+00:00')) for value in time_list]
    parsed_utc = [value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
                  for value in parsed]
    closest = min(range(len(parsed_utc)), key=lambda i: abs((parsed_utc[i] - target_utc).total_seconds()))
    return closest if abs((parsed_utc[closest] - target_utc).total_seconds()) <= 1800 else None


def enrich_routes_with_weather(routes: list[dict], load_weight_lbs: float, departure_dt: datetime) -> list[dict]:
    route_checkpoints = [route.get('checkpoints', []) for route in routes]
    all_checkpoints = [cp for checkpoints in route_checkpoints for cp in checkpoints]
    fetched = fetch_weather_batch([(cp['latitude'], cp['longitude']) for cp in all_checkpoints])

    cursor = 0
    for route, checkpoints in zip(routes, route_checkpoints):
        weather_items = fetched[cursor:cursor + len(checkpoints)]
        cursor += len(checkpoints)
        if not checkpoints:
            route['weather_available'] = False
            continue

        timeline = {hour: [] for hour in range(49)}
        for idx, cp in enumerate(checkpoints):
            raw = weather_items[idx] if idx < len(weather_items) else {}
            hourly = raw.get('hourly') or {}
            times = hourly.get('time') or []
            wind, rain, snow, temp = (hourly.get(k) or [] for k in ('wind_speed_10m', 'rain', 'snowfall', 'temperature_2m'))
            eta = datetime.fromisoformat(cp['eta_iso'].replace('Z', '+00:00'))
            eta_idx = get_closest_hour_index(times, eta)
            complete = (eta_idx is not None and eta_idx < len(wind) and eta_idx < len(rain) and eta_idx < len(snow)
                        and wind[eta_idx] is not None and rain[eta_idx] is not None and snow[eta_idx] is not None)
            risk = evaluate_checkpoint(float(wind[eta_idx]), float(rain[eta_idx]), float(snow[eta_idx]), load_weight_lbs) if complete else None
            temp_f = float(temp[eta_idx]) if complete and eta_idx < len(temp) and temp[eta_idx] is not None else None
            cp['weather'] = ({'wind_mph': risk['wind_mph'], 'rain_in_per_hr': risk['rain_in_per_hr'],
                              'snow_in_per_hr': risk['snow_in_per_hr'], 'temperature_f': round(temp_f, 1) if temp_f is not None else None,
                              'source': 'Open-Meteo'} if risk else None)
            cp['risk'] = risk

            base_idx = get_closest_hour_index(times, departure_dt) if times else 0
            for hour in timeline:
                hidx = base_idx + hour if base_idx is not None else -1
                available = (hidx >= 0 and hidx < len(times) and hidx < len(wind) and hidx < len(rain) and hidx < len(snow)
                             and hidx < len(temp) and wind[hidx] is not None and rain[hidx] is not None
                             and snow[hidx] is not None and temp[hidx] is not None)
                point = {'checkpoint_id': cp['checkpoint_id'], 'lat': cp['latitude'], 'lon': cp['longitude'],
                         'weather_available': bool(available)}
                if available:
                    evaluated = evaluate_checkpoint(float(wind[hidx]), float(rain[hidx]), float(snow[hidx]), load_weight_lbs)
                    point.update({'wind_mph': evaluated['wind_mph'], 'rain_in': evaluated['rain_in_per_hr'],
                                  'snow_in': evaluated['snow_in_per_hr'], 'temperature_f': round(float(temp[hidx]), 1),
                                  'risk': evaluated['overall_risk'], 'score': evaluated['score'], 'color': evaluated['color']})
                timeline[hour].append(point)

        miles = {'Severe': 0.0, 'No Travel': 0.0, 'High': 0.0, 'Moderate': 0.0, 'Low': 0.0}
        for idx in range(len(checkpoints) - 1):
            start = float(checkpoints[idx].get('distance_from_origin_miles', 0))
            end = float(checkpoints[idx + 1].get('distance_from_origin_miles', start))
            segment = checkpoints[idx:idx + 2]
            available_risks = [cp['risk']['overall_risk'] for cp in segment if cp.get('risk')]
            if len(available_risks) == 2:
                miles[max(available_risks, key=LEVEL_ORDER.index)] += max(0.0, end - start)
        scores = [cp['risk']['score'] for cp in checkpoints if cp.get('risk')]
        route_weather_available = bool(scores) and len(scores) == len(checkpoints)
        route['severe_and_no_travel_miles'] = round(miles['Severe'] + miles['No Travel'], 1) if route_weather_available else None
        route['high_miles'] = round(miles['High'], 1) if route_weather_available else None
        route['moderate_miles'] = round(miles['Moderate'], 1) if route_weather_available else None
        route['low_miles'] = round(miles['Low'], 1) if route_weather_available else None
        route['average_risk_score'] = round(sum(scores) / len(scores), 2) if route_weather_available else None
        route['corridor_timeline'] = timeline
        route['weather_available'] = route_weather_available
    return routes
