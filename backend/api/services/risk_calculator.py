"""
Risk calculation service based on SafeHaul challenge rules.
"""

# Risk levels mapping
RISK_LEVELS = {
    'Low': {'score': 1, 'color': '#10B981', 'badge_bg': '#DCFCE7', 'badge_text': '#166534'},
    'Moderate': {'score': 2, 'color': '#F59E0B', 'badge_bg': '#FEF3C7', 'badge_text': '#92400E'},
    'High': {'score': 3, 'color': '#F97316', 'badge_bg': '#FFEDD5', 'badge_text': '#9A3412'},
    'Severe': {'score': 4, 'color': '#EF4444', 'badge_bg': '#FEE2E2', 'badge_text': '#991B1B'},
    'No Travel': {'score': 5, 'color': '#7F1D1D', 'badge_bg': '#450A0A', 'badge_text': '#FCA5A5'}
}

LEVEL_ORDER = ['Low', 'Moderate', 'High', 'Severe', 'No Travel']

def get_wind_risk(wind_mph: float) -> str:
    if wind_mph >= 55.0:
        return 'No Travel'
    elif wind_mph >= 45.0:
        return 'Severe'
    elif wind_mph >= 35.0:
        return 'High'
    elif wind_mph >= 25.0:
        return 'Moderate'
    else:
        return 'Low'

def get_rain_risk(rain_in_per_hr: float) -> str:
    if rain_in_per_hr > 1.00:
        return 'No Travel'
    elif rain_in_per_hr >= 0.50:
        return 'Severe'
    elif rain_in_per_hr >= 0.25:
        return 'High'
    elif rain_in_per_hr >= 0.10:
        return 'Moderate'
    else:
        return 'Low'

def get_snow_risk(snow_in_per_hr: float) -> str:
    if snow_in_per_hr > 3.0:
        return 'No Travel'
    elif snow_in_per_hr >= 2.0:
        return 'Severe'
    elif snow_in_per_hr >= 1.0:
        return 'High'
    elif snow_in_per_hr >= 0.5:
        return 'Moderate'
    else:
        return 'Low'

def apply_load_rules(wind_mph: float, load_weight_lbs: float, base_wind_risk: str) -> tuple[str, list[str]]:
    """
    Load rules:
    - >=55 mph -> No Travel for any load
    - 45-54 mph + >30,000 lb -> No Travel
    - 35-44 mph + >40,000 lb -> Severe
    """
    adjusted_risk = base_wind_risk
    notes = []

    if wind_mph >= 55.0:
        adjusted_risk = 'No Travel'
        notes.append(f"Wind >= 55 mph ({wind_mph:.1f} mph): Mandatory No Travel for all loads")
    elif 45.0 <= wind_mph < 55.0:
        if load_weight_lbs > 30000:
            adjusted_risk = 'No Travel'
            notes.append(f"Wind {wind_mph:.1f} mph + Load {load_weight_lbs:,.0f} lbs (>30k lbs): Elevated to No Travel")
        else:
            notes.append(f"Wind {wind_mph:.1f} mph: Severe risk (Load under 30k lbs threshold)")
    elif 35.0 <= wind_mph < 45.0:
        if load_weight_lbs > 40000:
            adjusted_risk = 'Severe'
            notes.append(f"Wind {wind_mph:.1f} mph + Heavy Load {load_weight_lbs:,.0f} lbs (>40k lbs): Elevated from High to Severe")
        else:
            notes.append(f"Wind {wind_mph:.1f} mph: High risk")

    return adjusted_risk, notes

def evaluate_checkpoint(wind_mph: float, rain_in: float, snow_in: float, load_weight_lbs: float) -> dict:
    base_wind = get_wind_risk(wind_mph)
    wind_adjusted, load_notes = apply_load_rules(wind_mph, load_weight_lbs, base_wind)
    rain_risk = get_rain_risk(rain_in)
    snow_risk = get_snow_risk(snow_in)

    # The overall checkpoint risk is the maximum risk condition
    conditions = [
        ('Wind', wind_adjusted, wind_mph, 'mph'),
        ('Rain', rain_risk, rain_in, 'in/hr'),
        ('Snow', snow_risk, snow_in, 'in/hr')
    ]

    highest_level = 'Low'
    governing_factor = 'Clear conditions'

    for factor, lvl, val, unit in conditions:
        if LEVEL_ORDER.index(lvl) > LEVEL_ORDER.index(highest_level):
            highest_level = lvl
            governing_factor = f"{factor} ({val:.2f} {unit})"
        elif LEVEL_ORDER.index(lvl) == LEVEL_ORDER.index(highest_level) and lvl != 'Low':
            governing_factor += f", {factor} ({val:.2f} {unit})"

    risk_meta = RISK_LEVELS[highest_level]

    return {
        'wind_mph': round(wind_mph, 1),
        'wind_risk': wind_adjusted,
        'base_wind_risk': base_wind,
        'rain_in_per_hr': round(rain_in, 3),
        'rain_risk': rain_risk,
        'snow_in_per_hr': round(snow_in, 3),
        'snow_risk': snow_risk,
        'overall_risk': highest_level,
        'score': risk_meta['score'],
        'color': risk_meta['color'],
        'governing_factor': governing_factor,
        'load_notes': load_notes
    }

def rank_routes(routes: list[dict]) -> list[dict]:
    """
    Route Recommendation preference:
    1. Fewest Severe miles (Severe + No Travel)
    2. Fewest High miles
    3. Lowest average risk
    4. Shortest travel times
    """
    if not routes:
        return []

    weather_missing = not all(r.get('weather_available') for r in routes)

    # When any route lacks forecast coverage, only compare drive time.
    def sort_key(r):
        if weather_missing:
            return (r.get('duration_seconds', 0),)
        severe_miles = r.get('severe_and_no_travel_miles', 0)
        high_miles = r.get('high_miles', 0)
        avg_risk = r.get('average_risk_score', 0)
        duration_sec = r.get('duration_seconds', 0)
        return (severe_miles, high_miles, avg_risk, duration_sec)

    sorted_routes = sorted(routes, key=sort_key)

    # Set recommendations
    for i, r in enumerate(sorted_routes):
        if i == 0:
            r['is_recommended'] = True
            r['rank'] = 1
            r['recommendation_reason'] = ("Weather data is unavailable. Routes are ordered by travel time; safety recommendation is unavailable."
                if weather_missing else (
                f"Safest route: {r.get('severe_and_no_travel_miles', 0):.1f} severe/no-travel mi, "
                f"{r.get('high_miles', 0):.1f} high risk mi, "
                f"avg risk {r.get('average_risk_score', 0):.2f}/5, "
                f"travel time {r.get('duration_text', '')}."
            ))
        else:
            r['is_recommended'] = False
            r['rank'] = i + 1
            if weather_missing:
                r['recommendation_reason'] = "Weather data is unavailable. Compare travel times; safety ranking is unavailable."
                continue
            reasons = []
            diff_severe = r.get('severe_and_no_travel_miles', 0) - sorted_routes[0].get('severe_and_no_travel_miles', 0)
            if diff_severe > 0:
                reasons.append(f"+{diff_severe:.1f} mi severe hazard")
            diff_high = r.get('high_miles', 0) - sorted_routes[0].get('high_miles', 0)
            if diff_high > 0:
                reasons.append(f"+{diff_high:.1f} mi high hazard")
            diff_time = r.get('duration_seconds', 0) - sorted_routes[0].get('duration_seconds', 0)
            if diff_time > 0:
                reasons.append(f"+{round(diff_time/60)} min duration")
            r['recommendation_reason'] = "Alternative route: " + (", ".join(reasons) if reasons else "Similar risk profile")

    return sorted_routes
