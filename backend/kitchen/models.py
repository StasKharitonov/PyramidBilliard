from decimal import Decimal

from django.conf import settings
from django.db import models


class FoodCategory(models.Model):
    name = models.CharField("Название", max_length=100, unique=True)

    class Meta:
        verbose_name = "Категория блюд"
        verbose_name_plural = "Категории блюд"
        ordering = ["name"]

    def __str__(self):
        return self.name


class FoodItem(models.Model):
    category = models.ForeignKey(
        FoodCategory,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Категория",
    )
    name = models.CharField("Название", max_length=150)
    description = models.TextField("Описание", blank=True)
    price = models.DecimalField("Цена", max_digits=8, decimal_places=2)
    image_url = models.URLField("Ссылка на фото", blank=True)
    is_available = models.BooleanField("Доступно", default=True)

    class Meta:
        verbose_name = "Блюдо"
        verbose_name_plural = "Блюда"
        ordering = ["category__name", "name"]

    def __str__(self):
        return self.name


class FoodOrder(models.Model):
    NEW = "new"
    COOKING = "cooking"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (NEW, "Новый"),
        (COOKING, "Готовится"),
        (READY, "Готов"),
        (DELIVERED, "Доставлен"),
        (CANCELLED, "Отменён"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="food_orders",
        verbose_name="Пользователь",
    )
    status = models.CharField(
        "Статус", max_length=20, choices=STATUS_CHOICES, default=NEW
    )
    total_price = models.DecimalField(
        "Сумма заказа", max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        verbose_name = "Заказ еды"
        verbose_name_plural = "Заказы еды"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Заказ #{self.pk} — {self.user}"

    def recalculate_total(self):
        """Sum of all line items; the order total is never trusted from input."""
        total = sum((item.subtotal for item in self.items.all()), Decimal("0.00"))
        self.total_price = total
        return total


class FoodOrderItem(models.Model):
    order = models.ForeignKey(
        FoodOrder,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Заказ",
    )
    food_item = models.ForeignKey(
        FoodItem,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="Блюдо",
    )
    quantity = models.PositiveIntegerField("Количество", default=1)
    # Price per unit captured at the time of ordering (snapshot).
    price = models.DecimalField("Цена за единицу", max_digits=8, decimal_places=2)

    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"

    def __str__(self):
        return f"{self.food_item.name} × {self.quantity}"

    @property
    def subtotal(self):
        return self.price * self.quantity
