# 🎱 Бильярдный клуб «Зелёное сукно»

Полноценный сайт бильярдного клуба: бронирование столов, турниры и заказ еды
с кухни. Backend на **Django + Django REST Framework + JWT**, frontend на
**React + Vite**.

Это не демо-макет — все бизнес-правила реализованы на бэкенде, цены считаются на
сервере, доступ к защищённым действиям закрыт JWT-авторизацией.

---

## 🧱 Стек

| Слой       | Технологии                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Backend    | Python, Django 6, Django REST Framework, SimpleJWT, django-cors-headers    |
| База       | SQLite (локально), легко переключается на PostgreSQL                       |
| Frontend   | React 18, Vite, React Router, Axios                                        |
| Авторизация| JWT (access + refresh), автоматическое обновление токена                   |

---

## 📁 Структура проекта

```
.
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── billiard_club/          # настройки проекта
│   │   ├── settings.py         # CORS, JWT, DRF, БД
│   │   ├── urls.py
│   │   ├── wsgi.py / asgi.py
│   ├── accounts/               # пользователи, регистрация, логин, профиль
│   ├── tables/                 # столы и бронирования
│   ├── tournaments/            # турниры и регистрации
│   ├── kitchen/                # категории, блюда, заказы
│   └── core/                   # общие permissions + команда seed
│       └── management/commands/seed.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                # client.js, auth.js, tables.js, tournaments.js, kitchen.js
        ├── context/            # AuthContext, CartContext, ToastContext
        ├── components/         # Header, Footer, ProtectedRoute, *Card, States
        ├── pages/              # Home, Login, Register, Profile, Tables, ...
        ├── utils/format.js
        └── styles/global.css
```

---

## 🚀 Запуск

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate           # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # для входа в админку (вводите email и пароль)
python manage.py seed              # демо-данные + тестовый пользователь
python manage.py runserver         # http://localhost:8000
```

Бэкенд поднимется на **http://localhost:8000**, API — на **http://localhost:8000/api/**,
админка — на **http://localhost:8000/admin/**.

> Миграции уже сгенерированы и лежат в репозитории, поэтому достаточно `migrate`.

### 2. Frontend

В новом терминале:

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Откройте **http://localhost:5173** в браузере.

> Frontend по умолчанию обращается к `http://localhost:8000/api`. Чтобы изменить
> адрес API, создайте файл `frontend/.env` с переменной `VITE_API_URL=...`.

---

## 👤 Тестовый пользователь

Создаётся командой `python manage.py seed`:

```
email:    test@example.com
password: TestPassword123
```

У этого пользователя уже есть демо-бронь, регистрация на турнир и заказ еды —
чтобы профиль был не пустым.

## 🔐 Django Admin

1. Создайте суперпользователя: `python manage.py createsuperuser`.
2. Откройте **http://localhost:8000/admin/** и войдите.
3. В админке можно:
   - подтверждать / отменять брони (действия в списке «Бронирования»);
   - создавать и редактировать турниры;
   - менять статус заказов еды;
   - управлять столами, блюдами и категориями.

---

## 🌐 API endpoints

Базовый префикс: `/api/`

### Auth

| Метод | Путь                      | Доступ | Описание                          |
| ----- | ------------------------- | ------ | --------------------------------- |
| POST  | `/api/auth/register/`     | все    | Регистрация                       |
| POST  | `/api/auth/login/`        | все    | Логин (email + password) → токены |
| POST  | `/api/auth/token/refresh/`| все    | Обновление access-токена          |
| GET   | `/api/auth/profile/`      | JWT    | Профиль + брони, заказы, турниры   |

### Tables / Bookings

| Метод | Путь                              | Доступ | Описание                     |
| ----- | --------------------------------- | ------ | ---------------------------- |
| GET   | `/api/tables/`                    | все    | Список столов (`?type=`)     |
| GET   | `/api/tables/{id}/`               | все    | Карточка стола               |
| GET   | `/api/tables/{id}/availability/`  | все    | Занятость (`?date=YYYY-MM-DD`)|
| POST  | `/api/bookings/`                  | JWT    | Создать бронь                |
| GET   | `/api/bookings/my/`               | JWT    | Мои брони                    |
| PATCH | `/api/bookings/{id}/cancel/`      | JWT    | Отменить свою бронь          |

### Tournaments

| Метод  | Путь                                  | Доступ | Описание              |
| ------ | ------------------------------------- | ------ | --------------------- |
| GET    | `/api/tournaments/`                   | все    | Список (`?status=`)   |
| GET    | `/api/tournaments/{id}/`              | все    | Карточка турнира      |
| POST   | `/api/tournaments/{id}/register/`     | JWT    | Записаться            |
| DELETE | `/api/tournaments/{id}/unregister/`   | JWT    | Отменить запись       |

### Food

| Метод | Путь                       | Доступ | Описание                   |
| ----- | -------------------------- | ------ | -------------------------- |
| GET   | `/api/food/categories/`    | все    | Категории                  |
| GET   | `/api/food/items/`         | все    | Блюда (`?category=<id>`)   |
| POST  | `/api/food/orders/`        | JWT    | Оформить заказ             |
| GET   | `/api/food/orders/my/`     | JWT    | История заказов            |

---

## 🧭 Страницы фронтенда

| Путь                | Страница                              | Доступ    |
| ------------------- | ------------------------------------- | --------- |
| `/`                 | Главная (лендинг)                     | все       |
| `/login`            | Вход                                  | все       |
| `/register`         | Регистрация                           | все       |
| `/tables`           | Список столов + фильтр                 | все       |
| `/tables/:id`       | Стол + форма бронирования              | все*      |
| `/tournaments`      | Список турниров                        | все       |
| `/tournaments/:id`  | Турнир + регистрация                   | все*      |
| `/menu`             | Меню кухни + добавление в корзину      | все       |
| `/cart`             | Корзина + оформление заказа            | все*      |
| `/profile`          | Профиль (брони, заказы, турниры)       | только JWT|
| `/orders`           | История заказов еды                    | только JWT|

\* Страницу видно всем, но само действие (бронь / запись / оформление заказа)
требует входа — пользователя перенаправит на `/login`.

---

## ✅ Реализованные бизнес-правила

- Нельзя забронировать стол без авторизации.
- Нельзя отменить чужую бронь (объектная permission `IsOwner`).
- Нельзя заказать еду без авторизации.
- Нельзя записаться на турнир без авторизации.
- Нельзя записаться на один турнир дважды (уникальное ограничение в БД).
- Нельзя записаться на завершённый/отменённый турнир и при отсутствии мест.
- Бронь не может пересекаться по времени с другой активной бронью того же стола.
- Нельзя бронировать в прошлом.
- **Цена брони и сумма заказа считаются только на бэкенде** — данные о цене,
  присланные с фронтенда, игнорируются.
- Валидация выполняется и на фронтенде (UX), и на бэкенде (источник истины).

---

## 🧪 Сценарии для проверки

1. **Регистрация и вход**
   - Зарегистрируйтесь на `/register` → автоматический вход → попадаете в профиль.
   - Выйдите и войдите снова через `/login` (или тестовым аккаунтом).

2. **Бронирование стола**
   - `/tables` → фильтр по типу → выберите стол → форма бронирования.
   - Проверьте автоподсчёт «Предварительной стоимости».
   - Создайте бронь на сегодня/будущее → она появится в профиле.
   - Попробуйте забронировать пересекающееся время → ошибка от сервера.
   - Попробуйте дату в прошлом → ошибка.
   - Отмените бронь в профиле.

3. **Турниры**
   - `/tournaments` → откройте предстоящий турнир → запишитесь.
   - Повторная запись → ошибка «уже зарегистрированы».
   - Откройте завершённый турнир («Весенний классик») → запись закрыта.
   - Отмените регистрацию.

4. **Заказ еды**
   - `/menu` → фильтр по категориям → добавьте блюда в корзину (меняйте кол-во).
   - `/cart` → измените количество/удалите позиции → оформите заказ.
   - Заказ без входа → редирект на `/login`.
   - История заказов — в `/orders` и в профиле.

5. **Админка**
   - Войдите в `/admin/`, подтвердите бронь, смените статус заказа,
     создайте новый турнир — изменения сразу видны на сайте.

---

## 🐘 Переключение на PostgreSQL

В `backend/billiard_club/settings.py` база выбирается по переменным окружения.
Установите драйвер (`pip install "psycopg[binary]"`, строка есть в
`requirements.txt`) и задайте переменные перед запуском:

```bash
export DATABASE_ENGINE=postgresql
export DATABASE_NAME=billiard_club
export DATABASE_USER=postgres
export DATABASE_PASSWORD=postgres
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
python manage.py migrate && python manage.py seed
```

Модели и запросы менять не нужно — те же миграции применяются к PostgreSQL.

---

## 🛠️ Возможные проблемы

- **`npm install` падает с `EACCES` / `EEXIST` в `~/.npm/_cacache`** —
  повреждены права на кэш npm. Исправьте одним из способов:
  ```bash
  sudo chown -R $(whoami) ~/.npm        # вернуть права себе
  # или использовать временный кэш:
  npm install --cache /tmp/npm-cache
  ```

- **`Error: That port is already in use` при `runserver`** — порт 8000 занят.
  Запустите на другом порту: `python manage.py runserver 8001` и пропишите
  `VITE_API_URL=http://localhost:8001/api` в `frontend/.env`.

- **CORS-ошибки в консоли браузера** — убедитесь, что фронтенд работает на
  `http://localhost:5173` (этот origin разрешён в `settings.py`,
  `CORS_ALLOWED_ORIGINS`).

- **401 при защищённых запросах** — токен истёк; приложение автоматически
  обновляет access-токен по refresh-токену, при неудаче — разлогинивает.
