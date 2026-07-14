from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (EmailTokenObtainPairSerializer, ProfileSerializer,
                          RegisterSerializer, UserSerializer)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)


class EmailTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/login/ — obtain JWT access + refresh tokens."""

    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    """GET /api/auth/profile/ — current user with bookings, orders, tournaments."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
