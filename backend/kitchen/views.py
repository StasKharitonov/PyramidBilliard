from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import FoodCategory, FoodItem, FoodOrder
from .serializers import (FoodCategorySerializer, FoodItemSerializer,
                          FoodOrderCreateSerializer, FoodOrderSerializer)


class FoodCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/food/categories/"""

    queryset = FoodCategory.objects.all()
    serializer_class = FoodCategorySerializer
    permission_classes = [AllowAny]


class FoodItemViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/food/items/ (optional ?category=<id>)"""

    serializer_class = FoodItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = FoodItem.objects.filter(is_available=True).select_related("category")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        return qs


class FoodOrderViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /api/food/orders/      — create an order (auth required)
    GET  /api/food/orders/my/   — current user's order history
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            FoodOrder.objects.filter(user=self.request.user)
            .prefetch_related("items__food_item")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return FoodOrderCreateSerializer
        return FoodOrderSerializer

    @action(detail=False, methods=["get"])
    def my(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)
