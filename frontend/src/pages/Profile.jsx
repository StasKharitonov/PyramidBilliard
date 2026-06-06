import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { extractError } from '../api/client'
import { getProfile } from '../api/auth'
import { cancelBooking } from '../api/tables'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useToast } from '../context/ToastContext'
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
} from '../utils/format'

export default function Profile() {
  const { notify } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getProfile()
      .then(setProfile)
      .catch(() => setError('Не удалось загрузить профиль.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCancel = async (id) => {
    setCancellingId(id)
    try {
      await cancelBooking(id)
      notify('Бронь отменена', 'info')
      load()
    } catch (err) {
      notify(extractError(err, 'Не удалось отменить бронь'), 'error')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Загружаем профиль…" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container section">
        <ErrorState message={error || 'Профиль недоступен.'} onRetry={load} />
      </div>
    )
  }

  const initial = (profile.first_name || profile.email || '?')
    .charAt(0)
    .toUpperCase()

  return (
    <div className="container section">
      <div className="profile__head">
        <div className="avatar">{initial}</div>
        <div>
          <h1>{profile.full_name}</h1>
          <p className="muted">{profile.email}</p>
        </div>
      </div>

      <section className="profile__section">
        <h2>Мои брони</h2>
        {profile.bookings.length === 0 ? (
          <EmptyState message="Броней пока нет.">
            <Link to="/tables" className="btn btn--gold btn--sm">
              Забронировать стол
            </Link>
          </EmptyState>
        ) : (
          <div className="profile__list">
            {profile.bookings.map((b) => (
              <div key={b.id} className="profile__item card">
                <div>
                  <strong>{b.table_detail?.name}</strong>
                  <span className="muted">
                    {formatDate(b.date)}, {formatTime(b.start_time)}–
                    {formatTime(b.end_time)}
                  </span>
                </div>
                <div className="profile__item-right">
                  <span className={`status status--${b.status}`}>
                    {b.status_display}
                  </span>
                  <span className="price">{formatPrice(b.total_price)}</span>
                  {b.status !== 'cancelled' && (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                    >
                      {cancellingId === b.id ? '…' : 'Отменить'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="profile__section">
        <h2>Мои турниры</h2>
        {profile.tournaments.length === 0 ? (
          <EmptyState message="Вы пока не записаны на турниры.">
            <Link to="/tournaments" className="btn btn--gold btn--sm">
              К турнирам
            </Link>
          </EmptyState>
        ) : (
          <div className="profile__list">
            {profile.tournaments.map((r) => (
              <div key={r.id} className="profile__item card">
                <div>
                  <strong>{r.tournament.title}</strong>
                  <span className="muted">
                    {formatDate(r.tournament.date)},{' '}
                    {formatTime(r.tournament.start_time)}
                  </span>
                </div>
                <div className="profile__item-right">
                  <span className={`status status--${r.tournament.status}`}>
                    {r.tournament.status_display}
                  </span>
                  <Link
                    to={`/tournaments/${r.tournament.id}`}
                    className="btn btn--ghost btn--sm"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="profile__section">
        <h2>Мои заказы</h2>
        {profile.food_orders.length === 0 ? (
          <EmptyState message="Заказов пока нет.">
            <Link to="/menu" className="btn btn--gold btn--sm">
              В меню
            </Link>
          </EmptyState>
        ) : (
          <div className="profile__list">
            {profile.food_orders.map((o) => (
              <div key={o.id} className="profile__item card profile__item--column">
                <div className="profile__order-head">
                  <strong>Заказ #{o.id}</strong>
                  <span className="muted">{formatDateTime(o.created_at)}</span>
                  <span className={`status status--${o.status}`}>
                    {o.status_display}
                  </span>
                </div>
                <ul className="order__items">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      <span>
                        {it.food_item.name} × {it.quantity}
                      </span>
                      <span>{formatPrice(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="order__total">
                  <span>Итого</span>
                  <strong>{formatPrice(o.total_price)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
