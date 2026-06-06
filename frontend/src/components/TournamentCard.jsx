import { Link } from 'react-router-dom'

import { formatDate, formatPrice, formatTime } from '../utils/format'

const STATUS_CLASS = {
  upcoming: 'status--gold',
  active: 'status--green',
  finished: 'status--muted',
  cancelled: 'status--danger',
}

export default function TournamentCard({ tournament }) {
  return (
    <article className="card tournament-card">
      <div className="card__body">
        <div className="tournament-card__head">
          <span className={`status ${STATUS_CLASS[tournament.status] || ''}`}>
            {tournament.status_display}
          </span>
          {tournament.is_registered && (
            <span className="status status--green">Вы участвуете</span>
          )}
        </div>

        <h3 className="card__title">{tournament.title}</h3>
        <p className="card__text">{tournament.description}</p>

        <ul className="meta-list">
          <li>
            <span>Дата</span>
            <strong>{formatDate(tournament.date)}</strong>
          </li>
          <li>
            <span>Начало</span>
            <strong>{formatTime(tournament.start_time)}</strong>
          </li>
          <li>
            <span>Взнос</span>
            <strong>{formatPrice(tournament.entry_fee)}</strong>
          </li>
          <li>
            <span>Места</span>
            <strong>
              {tournament.participants_count}/{tournament.max_participants}
            </strong>
          </li>
        </ul>

        <div className="card__footer">
          <span className="prize">🏆 {tournament.prize}</span>
          <Link
            to={`/tournaments/${tournament.id}`}
            className="btn btn--ghost btn--sm"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  )
}
