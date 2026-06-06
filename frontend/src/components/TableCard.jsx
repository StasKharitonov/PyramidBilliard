import { Link } from 'react-router-dom'

import { formatPrice } from '../utils/format'

export default function TableCard({ table }) {
  return (
    <article className="card table-card">
      <div className={`table-card__top table-card__top--${table.table_type}`}>
        <span className="chip">{table.table_type_display}</span>
        <span className="table-card__balls" aria-hidden="true">
          🎱
        </span>
      </div>
      <div className="card__body">
        <h3 className="card__title">{table.name}</h3>
        <p className="card__text">{table.description}</p>
        <div className="card__footer">
          <span className="price">
            {formatPrice(table.hourly_price)}
            <small>/час</small>
          </span>
          <Link to={`/tables/${table.id}`} className="btn btn--gold btn--sm">
            Забронировать
          </Link>
        </div>
      </div>
    </article>
  )
}
