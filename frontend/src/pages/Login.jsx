import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/profile'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Введите email'
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Некорректный email'
    if (!password) e.password = 'Введите пароль'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      notify('Вы успешно вошли в аккаунт', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      notify(extractError(err, 'Неверный email или пароль'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container section auth">
      <div className="auth__card card">
        <h1>Вход в аккаунт</h1>
        <p className="auth__hint">
          Тестовый аккаунт: <code>test@example.com</code> /{' '}
          <code>TestPassword123</code>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'has-error' : ''}
            />
            {errors.email && <em className="field__error">{errors.email}</em>}
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'has-error' : ''}
            />
            {errors.password && (
              <em className="field__error">{errors.password}</em>
            )}
          </label>

          <button
            type="submit"
            className="btn btn--gold btn--block"
            disabled={submitting}
          >
            {submitting ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="auth__switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
