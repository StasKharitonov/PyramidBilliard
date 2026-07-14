import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <div className="logo logo--footer">
            <span className="logo__mark">🎱</span>
            <span className="logo__text">
              Пирам<span>ида</span>
            </span>
          </div>
          <p className="footer__about">
            Русский бильярд, пул и снукер, турниры и авторская кухня.
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
          <p> ул. Промышленная, 20, Чайковский</p>
          <p>
             <a>+7 (963) 018-62-60</a>
          </p>
        </div>

        <div className="footer__col">
          <h4>Часы работы</h4>
          <p>Пн–Вс: 10:00 — 02:00</p>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} Бильярдный клуб «Пирамида». Все права защищены.
        </div>
      </div>
    </footer>
  )
}
