import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Введите имя'
    if (!form.email.trim()) e.email = 'Введите email'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Некорректный email'
    if (!form.password) e.password = 'Введите пароль'
    else if (form.password.length < 8)
      e.password = 'Минимум 8 символов'
    if (form.password !== form.password2)
      e.password2 = 'Пароли не совпадают'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        password2: form.password2,
      })
      notify('Аккаунт создан. Добро пожаловать!', 'success')
      navigate('/profile', { replace: true })
    } catch (err) {
      notify(extractError(err, 'Не удалось зарегистрироваться'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container section auth">
      <div className="auth__card card">
        <h1>Регистрация</h1>
        <p className="auth__hint">
          Создайте аккаунт, чтобы бронировать столы, участвовать в турнирах и
          заказывать еду.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <label className="field">
              <span>Имя</span>
              <input
                type="text"
                value={form.first_name}
                onChange={update('first_name')}
                className={errors.first_name ? 'has-error' : ''}
              />
              {errors.first_name && (
                <em className="field__error">{errors.first_name}</em>
              )}
            </label>
            <label className="field">
              <span>Фамилия</span>
              <input
                type="text"
                value={form.last_name}
                onChange={update('last_name')}
              />
            </label>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={update('email')}
              className={errors.email ? 'has-error' : ''}
            />
            {errors.email && <em className="field__error">{errors.email}</em>}
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={form.password}
              autoComplete="new-password"
              onChange={update('password')}
              className={errors.password ? 'has-error' : ''}
            />
            {errors.password && (
              <em className="field__error">{errors.password}</em>
            )}
          </label>

          <label className="field">
            <span>Повторите пароль</span>
            <input
              type="password"
              value={form.password2}
              autoComplete="new-password"
              onChange={update('password2')}
              className={errors.password2 ? 'has-error' : ''}
            />
            {errors.password2 && (
              <em className="field__error">{errors.password2}</em>
            )}
          </label>

          <button
            type="submit"
            className="btn btn--gold btn--block"
            disabled={submitting}
          >
            {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth__switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
