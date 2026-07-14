from core.permissions import IsOwner
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import BilliardTable, Booking
from .serializers import BilliardTableSerializer, BookingSerializer


class BilliardTableViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/tables/                  — list active tables (optional ?type=...)
    GET /api/tables/{id}/             — table detail
    GET /api/tables/{id}/availability/?date=YYYY-MM-DD — booked slots
    """

    serializer_class = BilliardTableSerializer

    def get_queryset(self):
        qs = BilliardTable.objects.filter(is_active=True)
        table_type = self.request.query_params.get("type")
        if table_type:
            qs = qs.filter(table_type=table_type)
        return qs

    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        table = self.get_object()
        bookings = table.bookings.filter(status__in=Booking.ACTIVE_STATUSES)

        date = request.query_params.get("date")
        if date:
            bookings = bookings.filter(date=date)

        booked = [
            {
                "date": b.date,
                "start_time": b.start_time,
                "end_time": b.end_time,
                "status": b.status,
            }
            for b in bookings.order_by("date", "start_time")
        ]
        return Response({"table": table.id, "date": date, "booked": booked})


class BookingViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST  /api/bookings/             — create a booking (auth required)
    GET   /api/bookings/my/          — current user's bookings
    PATCH /api/bookings/{id}/cancel/ — cancel own booking
    """

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("table")
            .order_by("-created_at")
        )

    @action(detail=False, methods=["get"])
    def my(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAuthenticated, IsOwner],
    )
    def cancel(self, request, pk=None):
        booking = self.get_object()  # runs IsOwner check on the object
        if booking.status == Booking.CANCELLED:
            return Response(
                {"detail": "Бронь уже отменена."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.CANCELLED
        booking.save(update_fields=["status"])
        return Response(self.get_serializer(booking).data)
