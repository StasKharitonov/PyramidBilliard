"""Root URL configuration for billiard_club."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(_request):
    """Tiny health/landing endpoint so visiting the API base isn't a 404."""
    return JsonResponse(
        {
            "service": "Пирамида API",
            "status": "ok",
            "endpoints": {
                "auth": "/api/auth/",
                "tables": "/api/tables/",
                "bookings": "/api/bookings/",
                "tournaments": "/api/tournaments/",
                "food": "/api/food/",
                "admin": "/admin/",
            },
        }
    )


urlpatterns = [
    path("", api_root),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("tables.urls")),
    path("api/", include("tournaments.urls")),
    path("api/", include("kitchen.urls")),
]
