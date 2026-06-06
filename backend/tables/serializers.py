from django.utils import timezone
from rest_framework import serializers

from .models import BilliardTable, Booking


class BilliardTableSerializer(serializers.ModelSerializer):
    table_type_display = serializers.CharField(
        source="get_table_type_display", read_only=True
    )

    class Meta:
        model = BilliardTable
        fields = [
            "id",
            "name",
            "table_type",
            "table_type_display",
            "hourly_price",
            "description",
            "is_active",
        ]


class BookingSerializer(serializers.ModelSerializer):
    # Nested read-only table info for convenient rendering on the frontend.
    table_detail = BilliardTableSerializer(source="table", read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "table",
            "table_detail",
            "date",
            "start_time",
            "end_time",
            "status",
            "status_display",
            "total_price",
            "created_at",
        ]
        read_only_fields = ["status", "total_price", "created_at"]

    def validate(self, attrs):
        table = attrs["table"]
        date = attrs["date"]
        start = attrs["start_time"]
        end = attrs["end_time"]

        if not table.is_active:
            raise serializers.ValidationError(
                {"table": "Этот стол сейчас недоступен для бронирования."}
            )

        if start >= end:
            raise serializers.ValidationError(
                {"end_time": "Время окончания должно быть позже времени начала."}
            )

        today = timezone.localdate()
        now = timezone.localtime().time()
        if date < today:
            raise serializers.ValidationError(
                {"date": "Нельзя бронировать в прошлом."}
            )
        if date == today and start <= now:
            raise serializers.ValidationError(
                {"start_time": "Время начала уже прошло. Выберите более позднее время."}
            )

        # Overlap check: another active booking of the SAME table on the SAME
        # date whose interval intersects [start, end).
        overlapping = Booking.objects.filter(
            table=table,
            date=date,
            status__in=Booking.ACTIVE_STATUSES,
            start_time__lt=end,
            end_time__gt=start,
        )
        if self.instance is not None:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError(
                "Стол уже забронирован на пересекающееся время. "
                "Выберите другое время или стол."
            )

        return attrs

    def create(self, validated_data):
        booking = Booking(**validated_data)
        booking.user = self.context["request"].user
        booking.status = Booking.PENDING
        # total_price is ALWAYS computed on the backend — never trusted from input.
        booking.total_price = booking.calculate_total_price()
        booking.save()
        return booking
