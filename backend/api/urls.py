from django.urls import path
from api.views import PlanRouteView, GeocodeView, HealthView

urlpatterns = [
    path('plan-route/', PlanRouteView.as_view(), name='plan-route'),
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    path('health/', HealthView.as_view(), name='health'),
]
