from django.conf import settings
from django.db import models


class Tournament(models.Model):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    FINISHED = "finished"
    CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (UPCOMING, "Предстоит"),
        (ACTIVE, "Идёт"),
        (FINISHED, "Завершён"),
        (CANCELLED, "Отменён"),
    ]
    # Registration is closed for these statuses.
    CLOSED_STATUSES = [FINISHED, CANCELLED]

    title = models.CharField("Название", max_length=150)
    description = models.TextField("Описание", blank=True)
    date = models.DateField("Дата")
    start_time = models.TimeField("Время начала")
    max_participants = models.PositiveIntegerField("Макс. участников", default=16)
    entry_fee = models.DecimalField(
        "Взнос за участие", max_digits=8, decimal_places=2, default=0
    )
    prize = models.CharField("Призовой фонд", max_length=200, blank=True)
    status = models.CharField(
        "Статус", max_length=20, choices=STATUS_CHOICES, default=UPCOMING
    )
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        verbose_name = "Турнир"
        verbose_name_plural = "Турниры"
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.date})"

    @property
    def participants_count(self):
        return self.registrations.count()

    @property
    def spots_left(self):
        return max(self.max_participants - self.participants_count, 0)

    @property
    def is_full(self):
        return self.participants_count >= self.max_participants

    @property
    def registration_open(self):
        return self.status not in self.CLOSED_STATUSES and not self.is_full


class TournamentRegistration(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="registrations",
        verbose_name="Турнир",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tournament_registrations",
        verbose_name="Пользователь",
    )
    created_at = models.DateTimeField("Создана", auto_now_add=True)

    class Meta:
        verbose_name = "Регистрация на турнир"
        verbose_name_plural = "Регистрации на турниры"
        ordering = ["-created_at"]
        # A user cannot register for the same tournament twice.
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "user"],
                name="unique_tournament_registration",
            )
        ]

    def __str__(self):
        return f"{self.user} → {self.tournament}"
