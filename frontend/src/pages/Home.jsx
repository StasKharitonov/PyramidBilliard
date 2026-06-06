import { Link } from 'react-router-dom'

const ADVANTAGES = [
  {
    icon: '🎱',
    title: '6 профессиональных столов',
    text: 'Русский бильярд, американский пул и снукер от ведущих производителей.',
  },
  {
    icon: '🏆',
    title: 'Регулярные турниры',
    text: 'Турниры с реальными призовыми фондами для игроков любого уровня.',
  },
  {
    icon: '🍽️',
    title: 'Авторская кухня',
    text: 'Свежая еда и напитки прямо к вашему столу, пока вы играете.',
  },
  {
    icon: '⭐',
    title: 'Премиальная атмосфера',
    text: 'Уютные залы, профессиональное освещение и внимательный сервис.',
  },
]

const SCHEDULE = [
  { day: 'Понедельник — Четверг', hours: '12:00 — 02:00' },
  { day: 'Пятница — Суббота', hours: '12:00 — 06:00' },
  { day: 'Воскресенье', hours: '12:00 — 00:00' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__eyebrow">Премиальный бильярдный клуб</span>
          <h1 className="hero__title">
            Зелёное <span>сукно</span>
          </h1>
          <p className="hero__subtitle">
            Идеальные столы, атмосфера большой игры и кухня высокого уровня.
            Бронируйте стол, участвуйте в турнирах и наслаждайтесь вечером.
          </p>
          <div className="hero__actions">
            <Link to="/tables" className="btn btn--gold">
              Забронировать стол
            </Link>
            <Link to="/tournaments" className="btn btn--outline">
              Посмотреть турниры
            </Link>
            <Link to="/menu" className="btn btn--ghost">
              Меню кухни
            </Link>
          </div>
          <dl className="hero__stats">
            <div>
              <dt>6</dt>
              <dd>столов</dd>
            </div>
            <div>
              <dt>3</dt>
              <dd>вида игры</dd>
            </div>
            <div>
              <dt>18ч</dt>
              <dd>в день</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section container">
        <header className="page-head page-head--center">
          <h2>О клубе</h2>
          <p>
            «Зелёное сукно» — это место, где встречаются профессионалы и
            любители бильярда. Мы создали пространство, в котором каждая партия
            становится событием: турнирные столы, идеальное освещение и сервис,
            который заботится о каждой детали вашего вечера.
          </p>
        </header>
      </section>

      <section className="section section--alt">
        <div className="container">
          <header className="page-head page-head--center">
            <h2>Почему выбирают нас</h2>
          </header>
          <div className="grid grid--features">
            {ADVANTAGES.map((a) => (
              <div className="feature" key={a.title}>
                <span className="feature__icon">{a.icon}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="grid grid--split">
          <div className="panel">
            <h2>График работы</h2>
            <ul className="schedule">
              {SCHEDULE.map((s) => (
                <li key={s.day}>
                  <span>{s.day}</span>
                  <strong>{s.hours}</strong>
                </li>
              ))}
            </ul>
            <p className="panel__note">
              Рекомендуем бронировать стол заранее — в выходные места
              разбирают быстро.
            </p>
          </div>

          <div className="panel">
            <h2>Контакты</h2>
            <ul className="contacts">
              <li>
                <span>Адрес</span>
                <strong>ул. Бильярдная, 8, Москва</strong>
              </li>
              <li>
                <span>Телефон</span>
                <strong>
                  <a href="tel:+74951234567">+7 (495) 123-45-67</a>
                </strong>
              </li>
              <li>
                <span>Почта</span>
                <strong>
                  <a href="mailto:hello@green-cloth.ru">hello@green-cloth.ru</a>
                </strong>
              </li>
              <li>
                <span>Метро</span>
                <strong>Центральная, 5 минут пешком</strong>
              </li>
            </ul>
            <Link to="/tables" className="btn btn--gold">
              Забронировать стол
            </Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <h2>Готовы к игре?</h2>
          <p>Забронируйте стол прямо сейчас и проведите вечер красиво.</p>
          <Link to="/tables" className="btn btn--gold btn--lg">
            Выбрать стол
          </Link>
        </div>
      </section>
    </>
  )
}
