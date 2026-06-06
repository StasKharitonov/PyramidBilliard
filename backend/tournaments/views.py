from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Tournament, TournamentRegistration
from .serializers import TournamentSerializer


class TournamentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET    /api/tournaments/                 — list tournaments (optional ?status=)
    GET    /api/tournaments/{id}/            — tournament detail
    POST   /api/tournaments/{id}/register/   — register current user
    DELETE /api/tournaments/{id}/unregister/ — cancel current user's registration
    """

    serializer_class = TournamentSerializer

    def get_queryset(self):
        qs = Tournament.objects.all()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        tournament = self.get_object()

        if tournament.status in Tournament.CLOSED_STATUSES:
            return Response(
                {"detail": "Регистрация на этот турнир закрыта."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if TournamentRegistration.objects.filter(
            tournament=tournament, user=request.user
        ).exists():
            return Response(
                {"detail": "Вы уже зарегистрированы на этот турнир."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if tournament.is_full:
            return Response(
                {"detail": "Свободных мест больше нет."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        TournamentRegistration.objects.create(
            tournament=tournament, user=request.user
        )
        serializer = self.get_serializer(tournament)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def unregister(self, request, pk=None):
        tournament = self.get_object()
        registration = TournamentRegistration.objects.filter(
            tournament=tournament, user=request.user
        ).first()

        if registration is None:
            return Response(
                {"detail": "Вы не зарегистрированы на этот турнир."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration.delete()
        serializer = self.get_serializer(tournament)
        return Response(serializer.data, status=status.HTTP_200_OK)
