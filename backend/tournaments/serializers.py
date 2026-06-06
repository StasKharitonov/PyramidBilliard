from rest_framework import serializers

from .models import Tournament, TournamentRegistration


class TournamentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    participants_count = serializers.IntegerField(read_only=True)
    spots_left = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    registration_open = serializers.BooleanField(read_only=True)
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            "id",
            "title",
            "description",
            "date",
            "start_time",
            "max_participants",
            "entry_fee",
            "prize",
            "status",
            "status_display",
            "participants_count",
            "spots_left",
            "is_full",
            "registration_open",
            "is_registered",
            "created_at",
        ]

    def get_is_registered(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user).exists()
        return False


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    """Used inside the user profile to list registered tournaments."""

    tournament = TournamentSerializer(read_only=True)

    class Meta:
        model = TournamentRegistration
        fields = ["id", "tournament", "created_at"]
        read_only_fields = fields
