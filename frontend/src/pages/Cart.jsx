import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { extractError } from '../api/client'
import { createOrder } from '../api/kitchen'
import { EmptyState } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/format'

export default function Cart() {
  const { items, setQuantity, removeItem, clear, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (!isAuthenticated) {
      notify('Войдите, чтобы оформить заказ', 'info')
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    setSubmitting(true)
    try {
      const payload = items.map((i) => ({
        food_item: i.id,
        quantity: i.quantity,
      }))
      const order = await createOrder(payload)
      clear()
      notify(`Заказ оформлен на сумму ${formatPrice(order.total_price)}`, 'success')
      navigate('/orders')
    } catch (err) {
      notify(extractError(err, 'Не удалось оформить заказ'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <header className="page-head">
          <h1>Корзина</h1>
        </header>
        <EmptyState message="Ваша корзина пуста.">
          <Link to="/menu" className="btn btn--gold">
            Перейти в меню
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container section">
      <header className="page-head">
        <h1>Корзина</h1>
        <p>Проверьте заказ перед оформлением.</p>
      </header>

      <div className="cart">
        <ul className="cart__list">
          {items.map((i) => (
            <li key={i.id} className="cart__item card">
              <div className="cart__info">
                <strong>{i.name}</strong>
                <span className="muted">{formatPrice(i.price)} за шт.</span>
              </div>
              <div className="qty">
                <button
                  onClick={() => setQuantity(i.id, i.quantity - 1)}
                  aria-label="Уменьшить"
                >
                  −
                </button>
                <span>{i.quantity}</span>
                <button
                  onClick={() => setQuantity(i.id, i.quantity + 1)}
                  aria-label="Увеличить"
                >
                  +
                </button>
              </div>
              <div className="cart__sum">{formatPrice(i.price * i.quantity)}</div>
              <button
                className="cart__remove"
                onClick={() => removeItem(i.id)}
                aria-label="Удалить из корзины"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart__summary panel">
          <h2>Итого</h2>
          <div className="cart__total">
            <span>Сумма заказа</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <p className="estimate__note">
            Итоговую сумму подтверждает сервер при оформлении.
          </p>
          <button
            className="btn btn--gold btn--block"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting
              ? 'Оформляем…'
              : isAuthenticated
                ? 'Оформить заказ'
                : 'Войти и оформить'}
          </button>
          <button className="btn btn--ghost btn--block" onClick={clear}>
            Очистить корзину
          </button>
        </aside>
      </div>
    </div>
  )
}
