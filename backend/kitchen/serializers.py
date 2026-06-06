from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import FoodCategory, FoodItem, FoodOrder, FoodOrderItem


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ["id", "name"]


class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image_url",
            "is_available",
        ]


class FoodOrderItemSerializer(serializers.ModelSerializer):
    """Read representation of a line item, with the full dish nested."""

    food_item = FoodItemSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = FoodOrderItem
        fields = ["id", "food_item", "quantity", "price", "subtotal"]


class FoodOrderItemWriteSerializer(serializers.Serializer):
    """Write representation: only the dish id and the quantity are accepted."""

    food_item = serializers.PrimaryKeyRelatedField(
        queryset=FoodItem.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1, max_value=50)

    def validate_food_item(self, value):
        if not value.is_available:
            raise serializers.ValidationError(
                f"Блюдо «{value.name}» сейчас недоступно."
            )
        return value


class FoodOrderSerializer(serializers.ModelSerializer):
    """Read representation of an order with its line items."""

    items = FoodOrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )

    class Meta:
        model = FoodOrder
        fields = [
            "id",
            "status",
            "status_display",
            "total_price",
            "created_at",
            "items",
        ]
        read_only_fields = fields


class FoodOrderCreateSerializer(serializers.ModelSerializer):
    items = FoodOrderItemWriteSerializer(many=True, write_only=True)

    class Meta:
        model = FoodOrder
        fields = ["id", "items", "status", "total_price", "created_at"]
        read_only_fields = ["status", "total_price", "created_at"]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "Заказ не может быть пустым. Добавьте хотя бы одно блюдо."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        order = FoodOrder.objects.create(user=user, status=FoodOrder.NEW)

        total = Decimal("0.00")
        line_items = []
        for entry in items_data:
            food_item = entry["food_item"]
            quantity = entry["quantity"]
            # Price is taken from the database, NEVER from the client payload.
            unit_price = food_item.price
            total += unit_price * quantity
            line_items.append(
                FoodOrderItem(
                    order=order,
                    food_item=food_item,
                    quantity=quantity,
                    price=unit_price,
                )
            )

        FoodOrderItem.objects.bulk_create(line_items)
        order.total_price = total
        order.save(update_fields=["total_price"])
        return order

    def to_representation(self, instance):
        # Return the full read representation after creating.
        return FoodOrderSerializer(instance, context=self.context).data
