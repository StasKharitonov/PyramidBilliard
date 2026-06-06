import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <div className="logo logo--footer">
            <span className="logo__mark">🎱</span>
            <span className="logo__text">
              Зелёное<span>сукно</span>
            </span>
          </div>
          <p className="footer__about">
            Премиальный бильярдный клуб в самом сердце города. Русский бильярд,
            пул и снукер, турниры и авторская кухня.
          </p>
        </div>

        <div className="footer__col">
          <h4>Навигация</h4>
          <Link to="/tables">Бронирование столов</Link>
          <Link to="/tournaments">Турниры</Link>
          <Link to="/menu">Меню кухни</Link>
          <Link to="/profile">Профиль</Link>
        </div>

        <div className="footer__col">
          <h4>Контакты</h4>
          <p>📍 ул. Бильярдная, 8, Москва</p>
          <p>
            📞 <a href="tel:+74951234567">+7 (495) 123-45-67</a>
          </p>
          <p>
            ✉️ <a href="mailto:hello@green-cloth.ru">hello@green-cloth.ru</a>
          </p>
        </div>

        <div className="footer__col">
          <h4>Часы работы</h4>
          <p>Пн–Чт: 12:00 — 02:00</p>
          <p>Пт–Сб: 12:00 — 06:00</p>
          <p>Вс: 12:00 — 00:00</p>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} Бильярдный клуб «Зелёное сукно». Все права защищены.
        </div>
      </div>
    </footer>
  )
}
