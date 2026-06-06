from datetime import datetime
from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db import models


class BilliardTable(models.Model):
    RUSSIAN = "russian_pool"
    AMERICAN = "american_pool"
    SNOOKER = "snooker"
    TABLE_TYPES = [
        (RUSSIAN, "Русский бильярд"),
        (AMERICAN, "Американский пул"),
        (SNOOKER, "Снукер"),
    ]

    name = models.CharField("Название", max_length=100)
    table_type = models.CharField("Тип стола", max_length=20, choices=TABLE_TYPES)
    hourly_price = models.DecimalField("Цена за час", max_digits=8, decimal_places=2)
    description = models.TextField("Описание", blank=True)
    is_active = models.BooleanField("Активен", default=True)

    class Meta:
        verbose_name = "Бильярдный стол"
        verbose_name_plural = "Бильярдные столы"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_table_type_display()})"


class Booking(models.Model):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (PENDING, "Ожидает подтверждения"),
        (CONFIRMED, "Подтверждена"),
        (CANCELLED, "Отменена"),
    ]
    # Statuses that occupy a time slot (used for overlap checks).
    ACTIVE_STATUSES = [PENDING, CONFIRMED]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="Пользователь",
    )
    table = models.ForeignKey(
        BilliardTable,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="Стол",
    )
    date = models.DateField("Дата")
    start_time = models.TimeField("Время начала")
    end_time = models.TimeField("Время окончания")
    status = models.CharField(
        "Статус", max_length=20, choices=STATUS_CHOICES, default=PENDING
    )
    total_price = models.DecimalField(
        "Итоговая стоимость", max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    created_at = models.DateTimeField("Создано", auto_now_add=True)

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.table.name} — {self.date} {self.start_time}–{self.end_time}"

    @property
    def duration_hours(self):
        start = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        return Decimal((end - start).total_seconds()) / Decimal(3600)

    def calculate_total_price(self):
        """Price is always computed on the backend from the table's rate."""
        total = self.duration_hours * self.table.hourly_price
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
