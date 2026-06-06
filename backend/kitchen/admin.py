from django.contrib import admin

from .models import FoodCategory, FoodItem, FoodOrder, FoodOrderItem


@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "items_count"]
    search_fields = ["name"]

    @admin.display(description="Блюд")
    def items_count(self, obj):
        return obj.items.count()


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_available"]
    list_filter = ["category", "is_available"]
    search_fields = ["name", "description"]
    list_editable = ["price", "is_available"]
    autocomplete_fields = ["category"]


class FoodOrderItemInline(admin.TabularInline):
    model = FoodOrderItem
    extra = 0
    autocomplete_fields = ["food_item"]
    readonly_fields = ["subtotal"]

    @admin.display(description="Сумма")
    def subtotal(self, obj):
        return obj.subtotal


@admin.register(FoodOrder)
class FoodOrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "total_price", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["user__email"]
    list_editable = ["status"]
    readonly_fields = ["total_price", "created_at"]
    date_hierarchy = "created_at"
    inlines = [FoodOrderItemInline]
