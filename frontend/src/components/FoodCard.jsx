import { useState } from 'react'

import { formatPrice } from '../utils/format'

export default function FoodCard({ item, onAdd }) {
  const [qty, setQty] = useState(1)
  const [imgError, setImgError] = useState(false)

  return (
    <article className="card food-card">
      <div className="food-card__media">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="food-card__placeholder" aria-hidden="true">
            🍽️
          </div>
        )}
        {item.category_name && (
          <span className="chip chip--floating">{item.category_name}</span>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">{item.name}</h3>
        <p className="card__text">{item.description}</p>

        <div className="card__footer">
          <span className="price">{formatPrice(item.price)}</span>
          <div className="qty">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Уменьшить количество"
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Увеличить количество"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--gold btn--block"
          onClick={() => onAdd(item, qty)}
        >
          В корзину
        </button>
      </div>
    </article>
  )
}
