from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Compact representation of a user."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "date_joined"]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password], min_length=8
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password", "password2"]
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким email уже существует."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError(
                {"password2": "Пароли не совпадают."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login serializer that also returns the authenticated user's data."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """
    Full profile: user data plus their bookings, food orders and tournament
    registrations. Related serializers are imported lazily to avoid any
    import-time coupling between apps.
    """

    full_name = serializers.CharField(read_only=True)
    bookings = serializers.SerializerMethodField()
    food_orders = serializers.SerializerMethodField()
    tournaments = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "date_joined",
            "bookings",
            "food_orders",
            "tournaments",
        ]
        read_only_fields = fields

    def get_bookings(self, obj):
        from tables.serializers import BookingSerializer

        qs = obj.bookings.select_related("table").all()
        return BookingSerializer(qs, many=True, context=self.context).data

    def get_food_orders(self, obj):
        from kitchen.serializers import FoodOrderSerializer

        qs = obj.food_orders.prefetch_related("items__food_item").all()
        return FoodOrderSerializer(qs, many=True, context=self.context).data

    def get_tournaments(self, obj):
        from tournaments.serializers import TournamentRegistrationSerializer

        qs = obj.tournament_registrations.select_related("tournament").all()
        return TournamentRegistrationSerializer(
            qs, many=True, context=self.context
        ).data
