from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FoodCategoryViewSet, FoodItemViewSet, FoodOrderViewSet

router = DefaultRouter()
router.register("categories", FoodCategoryViewSet, basename="foodcategory")
router.register("items", FoodItemViewSet, basename="fooditem")
router.register("orders", FoodOrderViewSet, basename="foodorder")

urlpatterns = [
    path("food/", include(router.urls)),
]
