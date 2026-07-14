import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo__mark">🎱</span>
          <span className="logo__text">
            Пирам<span>ида</span>
          </span>
        </Link>

        <button
          className={`burger ${open ? 'burger--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Открыть меню"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${open ? 'nav--open' : ''}`} onClick={close}>
          <NavLink to="/tables" className="nav__link">
            Столы
          </NavLink>
          <NavLink to="/tournaments" className="nav__link">
            Турниры
          </NavLink>
          <NavLink to="/menu" className="nav__link">
            Меню
          </NavLink>
          <NavLink to="/cart" className="nav__link nav__cart">
            Корзина
            {totalQuantity > 0 && <span className="badge">{totalQuantity}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="nav__link">
                Профиль
              </NavLink>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav__link">
                Вход
              </NavLink>
              <NavLink to="/register" className="btn btn--gold btn--sm">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
