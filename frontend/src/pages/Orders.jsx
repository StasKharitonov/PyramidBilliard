import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getMyOrders } from '../api/kitchen'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { formatDateTime, formatPrice } from '../utils/format'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getMyOrders()
      .then(setOrders)
      .catch(() => setError('Не удалось загрузить заказы.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="container section">
      <header className="page-head">
        <h1>История заказов</h1>
        <p>Все ваши заказы с кухни.</p>
      </header>

      {loading ? (
        <Loader label="Загружаем заказы…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length === 0 ? (
        <EmptyState message="У вас пока нет заказов.">
          <Link to="/menu" className="btn btn--gold">
            Перейти в меню
          </Link>
        </EmptyState>
      ) : (
        <div className="orders">
          {orders.map((o) => (
            <div key={o.id} className="order card">
              <div className="order__head">
                <div>
                  <strong>Заказ #{o.id}</strong>
                  <span className="order__date muted">
                    {formatDateTime(o.created_at)}
                  </span>
                </div>
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
    </div>
  )
}
