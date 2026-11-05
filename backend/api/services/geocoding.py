"""
Geocoding service using OpenStreetMap Nominatim with local fallback and caching.
"""
import requests
import logging

logger = logging.getLogger(__name__)

# Predefined common logistics hubs / cities for instant fallback & fast UX
KNOWN_CITIES = {
    # Pakistan routes (as in user mockup screenshot)
    'karachi': {'name': 'Karachi, Pakistan', 'lat': 24.8607, 'lon': 67.0011},
    'lahore': {'name': 'Lahore, Pakistan', 'lat': 31.5204, 'lon': 74.3587},
    'islamabad': {'name': 'Islamabad, Pakistan', 'lat': 33.6844, 'lon': 73.0479},
    'multan': {'name': 'Multan, Pakistan', 'lat': 30.1575, 'lon': 71.5249},
    'faisalabad': {'name': 'Faisalabad, Pakistan', 'lat': 31.4504, 'lon': 73.1350},
    'rawalpindi': {'name': 'Rawalpindi, Pakistan', 'lat': 33.5651, 'lon': 73.0169},
    'peshawar': {'name': 'Peshawar, Pakistan', 'lat': 34.0151, 'lon': 71.5249},
    'quetta': {'name': 'Quetta, Pakistan', 'lat': 30.1798, 'lon': 66.9750},

    # North America routes
    'chicago': {'name': 'Chicago, IL', 'lat': 41.8781, 'lon': -87.6298},
    'denver': {'name': 'Denver, CO', 'lat': 39.7392, 'lon': -104.9903},
    'dallas': {'name': 'Dallas, TX', 'lat': 32.7767, 'lon': -96.7970},
    'atlanta': {'name': 'Atlanta, GA', 'lat': 33.7490, 'lon': -84.3880},
    'new york': {'name': 'New York, NY', 'lat': 40.7128, 'lon': -74.0060},
    'los angeles': {'name': 'Los Angeles, CA', 'lat': 34.0522, 'lon': -118.2437},
    'seattle': {'name': 'Seattle, WA', 'lat': 47.6062, 'lon': -122.3321},
    'salt lake city': {'name': 'Salt Lake City, UT', 'lat': 40.7608, 'lon': -111.8910},
    'kansas city': {'name': 'Kansas City, MO', 'lat': 39.0997, 'lon': -94.5786},
    'minneapolis': {'name': 'Minneapolis, MN', 'lat': 44.9778, 'lon': -93.2650},
    'houston': {'name': 'Houston, TX', 'lat': 29.7604, 'lon': -95.3698},
    'phoenix': {'name': 'Phoenix, AZ', 'lat': 33.4484, 'lon': -112.0740},
    'miami': {'name': 'Miami, FL', 'lat': 25.7617, 'lon': -80.1918},
    'boston': {'name': 'Boston, MA', 'lat': 42.3601, 'lon': -71.0589},
}

_GEOCODE_CACHE = {}

def geocode_location(query: str) -> dict:
    query_clean = str(query).strip()
    if not query_clean:
        raise ValueError("Location query cannot be empty")

    query_lower = query_clean.lower()
    # Match only on the city part (text before the first comma) to avoid wrong substring hits
    city_part = query_lower.split(',')[0].strip()
    if city_part in KNOWN_CITIES:
        city = KNOWN_CITIES[city_part]
        return {'display_name': city['name'], 'lat': city['lat'], 'lon': city['lon']}

    if query_lower in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[query_lower]

    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "SafeHaulTruckApp/1.0 (freight-safety-challenge)"}
    params = {"q": query_clean, "format": "json", "limit": 1}

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                first = data[0]
                result = {
                    'display_name': first.get('display_name', query_clean),
                    'lat': float(first['lat']),
                    'lon': float(first['lon'])
                }
                _GEOCODE_CACHE[query_lower] = result
                return result
    except Exception as e:
        logger.warning(f"Geocoding failed for {query_clean}: {e}")

    # Never silently fall back to a wrong city (previously Karachi) - report the problem instead
    raise ValueError(f"Could not find location: '{query_clean}'. Try 'City, State/Country'.")
