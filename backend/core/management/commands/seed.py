"""
Seed the database with demo data:
  * a test user (test@example.com / TestPassword123)
  * 6 billiard tables
  * 4 tournaments
  * 5 food categories with 20 dishes
  * a few sample bookings / registrations / orders for the test user

Idempotent: running it multiple times will not create duplicates.
"""

from datetime import time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from kitchen.models import FoodCategory, FoodItem, FoodOrder, FoodOrderItem
from tables.models import BilliardTable, Booking
from tournaments.models import Tournament, TournamentRegistration

User = get_user_model()


TABLES = [
    ("«Москва»", BilliardTable.RUSSIAN, "800.00",
     "Профессиональный стол для русского бильярда 12 футов с подогревом плиты."),
    ("«Санкт-Петербург»", BilliardTable.RUSSIAN, "750.00",
     "Классический русский бильярд 12 футов, турнирное сукно Iwan Simonis."),
    ("«Бостон»", BilliardTable.AMERICAN, "600.00",
     "Американский пул 9 футов, идеален для быстрой динамичной игры."),
    ("«Чикаго»", BilliardTable.AMERICAN, "650.00",
     "Пул 9 футов с профессиональной разметкой и фирменными шарами Aramith."),
    ("«Шеффилд»", BilliardTable.SNOOKER, "1000.00",
     "Полноразмерный снукерный стол 12 футов с премиальным освещением."),
    ("«Кристалл»", BilliardTable.SNOOKER, "1200.00",
     "VIP-снукер 12 футов в отдельном зале с панорамным видом."),
]

FOOD = {
    "Закуски": [
        ("Куриные крылышки BBQ", "Сочные крылышки в фирменном соусе барбекю.",
         "390.00", "chicken,wings"),
        ("Картофель фри", "Хрустящий картофель с морской солью и соусом.",
         "220.00", "fries"),
        ("Луковые кольца", "Золотистые кольца лука в хрустящей панировке.",
         "260.00", "onion,rings"),
        ("Начос с сыром", "Кукурузные чипсы с расплавленным сыром и сальсой.",
         "340.00", "nachos"),
    ],
    "Бургеры и стейки": [
        ("Классический бургер", "Говяжья котлета, овощи и фирменный соус.",
         "490.00", "burger"),
        ("Чизбургер", "Двойной чеддер, говядина и маринованные огурцы.",
         "540.00", "cheeseburger"),
        ("Стейк рибай", "Мраморная говядина на гриле с овощами.",
         "1290.00", "steak"),
        ("Куриный бургер", "Хрустящее куриное филе и соус ранч.",
         "450.00", "chicken,burger"),
    ],
    "Пицца": [
        ("Пепперони", "Пикантная пепперони и моцарелла.",
         "620.00", "pizza,pepperoni"),
        ("Маргарита", "Томаты, моцарелла и свежий базилик.",
         "540.00", "pizza,margherita"),
        ("Четыре сыра", "Моцарелла, пармезан, дорблю и чеддер.",
         "680.00", "pizza,cheese"),
        ("Барбекю", "Курица, бекон и соус барбекю.",
         "650.00", "pizza,bbq"),
    ],
    "Напитки": [
        ("Крафтовое пиво", "Местный лагер на разлив, 0.5 л.",
         "320.00", "beer,glass"),
        ("Домашний лимонад", "Освежающий лимонад с мятой, 0.4 л.",
         "240.00", "lemonade"),
        ("Эспрессо", "Двойной эспрессо из свежеобжаренных зёрен.",
         "180.00", "espresso,coffee"),
        ("Кола", "Классическая кола со льдом, 0.33 л.",
         "150.00", "cola,soda"),
    ],
    "Десерты": [
        ("Нью-Йорк чизкейк", "Нежный чизкейк с ягодным соусом.",
         "360.00", "cheesecake"),
        ("Тирамису", "Классический итальянский десерт с маскарпоне.",
         "390.00", "tiramisu"),
        ("Шоколадный фондан", "Тёплый кекс с жидкой шоколадной начинкой.",
         "410.00", "chocolate,cake"),
        ("Мороженое ассорти", "Три шарика пломбира с топпингом.",
         "280.00", "icecream"),
    ],
}


class Command(BaseCommand):
    help = "Заполняет базу демонстрационными данными."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Создание демо-данных...")

        user = self._create_test_user()
        self._create_tables()
        self._create_tournaments()
        self._create_food()
        self._create_sample_activity(user)

        self.stdout.write(self.style.SUCCESS("Готово! База заполнена демо-данными."))
        self.stdout.write(
            "Тестовый пользователь: test@example.com / TestPassword123"
        )

    # ------------------------------------------------------------------ #
    def _create_test_user(self):
        user, created = User.objects.get_or_create(
            email="test@example.com",
            defaults={"first_name": "Иван", "last_name": "Тестов"},
        )
        if created:
            user.set_password("TestPassword123")
            user.save()
            self.stdout.write("  + тестовый пользователь создан")
        else:
            self.stdout.write("  · тестовый пользователь уже существует")
        return user

    def _create_tables(self):
        for name, table_type, price, description in TABLES:
            BilliardTable.objects.get_or_create(
                name=name,
                defaults={
                    "table_type": table_type,
                    "hourly_price": Decimal(price),
                    "description": description,
                    "is_active": True,
                },
            )
        self.stdout.write(f"  + столов: {BilliardTable.objects.count()}")

    def _create_tournaments(self):
        today = timezone.localdate()
        data = [
            {
                "title": "Кубок открытия сезона",
                "description": "Главный турнир по русскому бильярду. "
                "Открытие сезона с участием сильнейших игроков клуба.",
                "date": today + timedelta(days=10),
                "start_time": time(18, 0),
                "max_participants": 16,
                "entry_fee": Decimal("1000.00"),
                "prize": "Призовой фонд 50 000 ₽",
                "status": Tournament.UPCOMING,
            },
            {
                "title": "Ночной турнир по пулу",
                "description": "Динамичный турнир по американскому пулу в "
                "формате до двух поражений.",
                "date": today + timedelta(days=20),
                "start_time": time(21, 0),
                "max_participants": 24,
                "entry_fee": Decimal("500.00"),
                "prize": "20 000 ₽ и кубок чемпиона",
                "status": Tournament.UPCOMING,
            },
            {
                "title": "Снукер Мастерс",
                "description": "Элитный турнир по снукеру для опытных игроков. "
                "Количество мест ограничено.",
                "date": today + timedelta(days=30),
                "start_time": time(16, 0),
                "max_participants": 8,
                "entry_fee": Decimal("1500.00"),
                "prize": "Призовой фонд 100 000 ₽",
                "status": Tournament.UPCOMING,
            },
            {
                "title": "Весенний классик",
                "description": "Прошедший турнир сезона. Архивная запись для "
                "демонстрации завершённых турниров.",
                "date": today - timedelta(days=15),
                "start_time": time(17, 0),
                "max_participants": 16,
                "entry_fee": Decimal("800.00"),
                "prize": "Кубок и памятные призы",
                "status": Tournament.FINISHED,
            },
        ]
        for item in data:
            Tournament.objects.get_or_create(
                title=item["title"], defaults=item
            )
        self.stdout.write(f"  + турниров: {Tournament.objects.count()}")

    def _create_food(self):
        item_count = 0
        for category_name, items in FOOD.items():
            category, _ = FoodCategory.objects.get_or_create(name=category_name)
            for name, description, price, keyword in items:
                lock = item_count + 1
                FoodItem.objects.get_or_create(
                    category=category,
                    name=name,
                    defaults={
                        "description": description,
                        "price": Decimal(price),
                        "image_url": (
                            f"https://loremflickr.com/600/400/{keyword}?lock={lock}"
                        ),
                        "is_available": True,
                    },
                )
                item_count += 1
        self.stdout.write(
            f"  + категорий: {FoodCategory.objects.count()}, "
            f"блюд: {FoodItem.objects.count()}"
        )

    def _create_sample_activity(self, user):
        # A sample upcoming booking for the test user.
        table = BilliardTable.objects.filter(name="«Москва»").first()
        if table and not user.bookings.exists():
            booking = Booking(
                user=user,
                table=table,
                date=timezone.localdate() + timedelta(days=2),
                start_time=time(18, 0),
                end_time=time(20, 0),
                status=Booking.CONFIRMED,
            )
            booking.total_price = booking.calculate_total_price()
            booking.save()

        # Register the test user for the first upcoming tournament.
        tournament = Tournament.objects.filter(
            status=Tournament.UPCOMING
        ).order_by("date").first()
        if tournament:
            TournamentRegistration.objects.get_or_create(
                tournament=tournament, user=user
            )

        # A sample completed food order.
        if not user.food_orders.exists():
            items = list(FoodItem.objects.all()[:2])
            if items:
                order = FoodOrder.objects.create(
                    user=user, status=FoodOrder.DELIVERED
                )
                total = Decimal("0.00")
                for food_item in items:
                    FoodOrderItem.objects.create(
                        order=order,
                        food_item=food_item,
                        quantity=1,
                        price=food_item.price,
                    )
                    total += food_item.price
                order.total_price = total
                order.save(update_fields=["total_price"])

        self.stdout.write("  + демо-активность тестового пользователя добавлена")
