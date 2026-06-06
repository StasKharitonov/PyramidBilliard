from django.contrib import admin

from .models import BilliardTable, Booking


@admin.register(BilliardTable)
class BilliardTableAdmin(admin.ModelAdmin):
    list_display = ["name", "table_type", "hourly_price", "is_active"]
    list_filter = ["table_type", "is_active"]
    search_fields = ["name", "description"]
    list_editable = ["hourly_price", "is_active"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "table",
        "user",
        "date",
        "start_time",
        "end_time",
        "status",
        "total_price",
        "created_at",
    ]
    list_filter = ["status", "date", "table__table_type"]
    search_fields = ["user__email", "table__name"]
    date_hierarchy = "date"
    autocomplete_fields = ["table", "user"]
    readonly_fields = ["total_price", "created_at"]
    actions = ["confirm_bookings", "cancel_bookings"]

    @admin.action(description="Подтвердить выбранные брони")
    def confirm_bookings(self, request, queryset):
        updated = queryset.update(status=Booking.CONFIRMED)
        self.message_user(request, f"Подтверждено броней: {updated}.")

    @admin.action(description="Отменить выбранные брони")
    def cancel_bookings(self, request, queryset):
        updated = queryset.update(status=Booking.CANCELLED)
        self.message_user(request, f"Отменено броней: {updated}.")
