import os
from django.urls import path, include, re_path
from django.http import HttpResponse, FileResponse, Http404
from django.conf import settings

FRONTEND_DIST = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist'))
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, 'assets')

def serve_react_asset(request, filename):
    filepath = os.path.join(FRONTEND_ASSETS, filename)
    if os.path.exists(filepath) and os.path.isfile(filepath):
        content_type = 'text/javascript' if filename.endswith('.js') else ('text/css' if filename.endswith('.css') else None)
        return FileResponse(open(filepath, 'rb'), content_type=content_type)
    raise Http404("Asset not found")

def serve_react_app(request):
    frontend_index = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.exists(frontend_index):
        return FileResponse(open(frontend_index, 'rb'), content_type="text/html")
    return HttpResponse(
        "<h1>SafeHaul Smart Truck Route Planning API</h1>"
        "<p>Backend is active. Use <code>/api/plan-route/</code> for routing calculations.</p>",
        content_type="text/html"
    )

urlpatterns = [
    path('api/', include('api.urls')),
    path('assets/<str:filename>', serve_react_asset),
    re_path(r'^(?!api/).*$', serve_react_app),
]
