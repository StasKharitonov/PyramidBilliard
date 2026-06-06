from rest_framework.routers import DefaultRouter

from .views import BilliardTableViewSet, BookingViewSet

router = DefaultRouter()
router.register("tables", BilliardTableViewSet, basename="table")
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = router.urls
