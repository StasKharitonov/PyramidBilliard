from django.contrib import admin

from .models import Tournament, TournamentRegistration


class TournamentRegistrationInline(admin.TabularInline):
    model = TournamentRegistration
    extra = 0
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at"]


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "date",
        "start_time",
        "status",
        "participants_count",
        "max_participants",
        "entry_fee",
    ]
    list_filter = ["status", "date"]
    search_fields = ["title", "description", "prize"]
    list_editable = ["status"]
    date_hierarchy = "date"
    inlines = [TournamentRegistrationInline]

    @admin.display(description="Участников")
    def participants_count(self, obj):
        return obj.participants_count


@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ["tournament", "user", "created_at"]
    list_filter = ["tournament"]
    search_fields = ["user__email", "tournament__title"]
    autocomplete_fields = ["tournament", "user"]
