import traceback
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.services.geocoding import geocode_location
from api.services.routing import generate_three_routes
from api.services.weather import enrich_routes_with_weather
from api.services.risk_calculator import rank_routes

class PlanRouteView(APIView):
    def post(self, request):
        try:
            data = request.data
            origin_input = data.get('origin', 'Chicago, IL')
            dest_input = data.get('destination', 'Denver, CO')
            departure_str = data.get('departure_time')
            load_weight = float(data.get('load_weight_lbs', 35000))
            sample_interval = float(data.get('sample_interval_miles', 25.0))
            if load_weight <= 0:
                raise ValueError('Load weight must be greater than zero.')

            # Validate sample interval: 10, 25, or 50 miles per PDF
            if sample_interval not in (10.0, 25.0, 50.0):
                sample_interval = 25.0

            # Keep the supplied timezone offset; normalize legacy naive values as UTC.
            if departure_str:
                try:
                    departure_dt = datetime.fromisoformat(str(departure_str).replace('Z', '+00:00'))
                except (TypeError, ValueError):
                    raise ValueError('Departure time is invalid. Choose a valid date and time.')
                if departure_dt.tzinfo is None:
                    departure_dt = departure_dt.replace(tzinfo=timezone.utc)
            else:
                departure_dt = datetime.now(timezone.utc)

            # Resolve coordinates
            if isinstance(origin_input, dict) and 'lat' in origin_input and 'lon' in origin_input:
                origin_geo = {
                    'display_name': origin_input.get('name', f"{origin_input['lat']:.3f}, {origin_input['lon']:.3f}"),
                    'lat': float(origin_input['lat']),
                    'lon': float(origin_input['lon'])
                }
            else:
                origin_geo = geocode_location(str(origin_input))

            if isinstance(dest_input, dict) and 'lat' in dest_input and 'lon' in dest_input:
                dest_geo = {
                    'display_name': dest_input.get('name', f"{dest_input['lat']:.3f}, {dest_input['lon']:.3f}"),
                    'lat': float(dest_input['lat']),
                    'lon': float(dest_input['lon'])
                }
            else:
                dest_geo = geocode_location(str(dest_input))

            # 1. Generate 3 routes with checkpoints sampled every 10 / 25 / 50 miles
            routes = generate_three_routes(
                start_lon=origin_geo['lon'],
                start_lat=origin_geo['lat'],
                end_lon=dest_geo['lon'],
                end_lat=dest_geo['lat'],
                departure_dt=departure_dt,
                interval_miles=sample_interval
            )
            if not routes:
                return Response({'status': 'error', 'message': 'No real driving route was returned by the routing service. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # 2. Enrich routes with weather at checkpoint arrival ETAs & calculate risk
            routes_with_weather = enrich_routes_with_weather(
                routes=routes,
                load_weight_lbs=load_weight,
                departure_dt=departure_dt
            )

            # 3. Rank routes according to preference rules
            ranked_routes = rank_routes(routes_with_weather)

            return Response({
                'status': 'success',
                'origin': origin_geo,
                'destination': dest_geo,
                'departure_time': departure_dt.isoformat(),
                'load_weight_lbs': load_weight,
                'sample_interval_miles': sample_interval,
                'routes_count': len(ranked_routes),
                'weather_available': bool(ranked_routes) and all(route.get('weather_available') for route in ranked_routes),
                'routes': ranked_routes
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class GeocodeView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'results': []}, status=status.HTTP_200_OK)

        try:
            res = geocode_location(query)
            return Response({'results': [res]}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'results': [], 'error': str(e)}, status=status.HTTP_200_OK)

class HealthView(APIView):
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'SafeHaul Backend API',
            'version': '1.0.0',
            'timestamp': datetime.now().isoformat()
        }, status=status.HTTP_200_OK)
