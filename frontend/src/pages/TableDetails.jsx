import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { extractError } from '../api/client'
import { createBooking, getAvailability, getTable } from '../api/tables'
import { ErrorState, Loader } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, formatTime } from '../utils/format'

const todayStr = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local

function minutes(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export default function TableDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { notify } = useToast()

  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('20:00')
  const [booked, setBooked] = useState([])
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getTable(id)
      .then((data) => {
        if (active) setTable(data)
      })
      .catch(() => {
        if (active) setError('Стол не найден или недоступен.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  // Refresh occupancy whenever the selected date changes.
  useEffect(() => {
    if (!id || !date) return
    let active = true
    getAvailability(id, date)
      .then((data) => {
        if (active) setBooked(data.booked || [])
      })
      .catch(() => {
        if (active) setBooked([])
      })
    return () => {
      active = false
    }
  }, [id, date])

  const estimate = useMemo(() => {
    if (!table) return null
    const start = minutes(startTime)
    const end = minutes(endTime)
    if (start == null || end == null || end <= start) return null
    const hours = (end - start) / 60
    return hours * Number(table.hourly_price)
  }, [table, startTime, endTime])

  const validate = () => {
    const start = minutes(startTime)
    const end = minutes(endTime)
    if (!date) return 'Выберите дату.'
    if (date < todayStr()) return 'Нельзя бронировать в прошлом.'
    if (start == null || end == null) return 'Укажите время начала и окончания.'
    if (end <= start) return 'Время окончания должно быть позже начала.'
    if (date === todayStr()) {
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      if (start <= nowMinutes) return 'Это время уже прошло. Выберите позднее.'
    }
    // Client-side overlap hint (the backend is the source of truth).
    const clash = booked.some((b) => {
      const bs = minutes(b.start_time)
      const be = minutes(b.end_time)
      return start < be && end > bs
    })
    if (clash) return 'Это время пересекается с другой бронью. Выберите другое.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError('')

    if (!isAuthenticated) {
      notify('Войдите, чтобы забронировать стол', 'info')
      navigate('/login', { state: { from: `/tables/${id}` } })
      return
    }

    setSubmitting(true)
    try {
      await createBooking({
        table: Number(id),
        date,
        start_time: startTime,
        end_time: endTime,
      })
      notify('Бронь создана! Ожидает подтверждения.', 'success')
      const refreshed = await getAvailability(id, date)
      setBooked(refreshed.booked || [])
    } catch (err) {
      const message = extractError(err, 'Не удалось создать бронь')
      setFormError(message)
      notify(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Загружаем стол…" />
      </div>
    )
  }

  if (error || !table) {
    return (
      <div className="container section">
        <ErrorState message={error || 'Стол не найден.'} />
        <div className="center">
          <Link to="/tables" className="btn btn--ghost">
            ← Ко всем столам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <Link to="/tables" className="back-link">
        ← Ко всем столам
      </Link>

      <div className="grid grid--split detail">
        <div className={`detail__hero detail__hero--${table.table_type}`}>
          <span className="chip">{table.table_type_display}</span>
          <span className="detail__ball" aria-hidden="true">
            🎱
          </span>
          <h1>{table.name}</h1>
          <p>{table.description}</p>
          <div className="detail__price">
            {formatPrice(table.hourly_price)}
            <small>/час</small>
          </div>
        </div>

        <div className="panel">
          <h2>Бронирование</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Дата</span>
              <input
                type="date"
                value={date}
                min={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Начало</span>
                <input
                  type="time"
                  value={startTime}
                  step="900"
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Окончание</span>
                <input
                  type="time"
                  value={endTime}
                  step="900"
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            <div className="estimate">
              <span>Предварительная стоимость</span>
              <strong>{estimate != null ? formatPrice(estimate) : '—'}</strong>
            </div>
            <p className="estimate__note">
              Итоговую сумму рассчитывает сервер при подтверждении брони.
            </p>

            {formError && <div className="alert alert--error">{formError}</div>}

            <button
              type="submit"
              className="btn btn--gold btn--block"
              disabled={submitting}
            >
              {submitting
                ? 'Бронируем…'
                : isAuthenticated
                  ? 'Забронировать'
                  : 'Войти и забронировать'}
            </button>
          </form>

          <div className="occupancy">
            <h3>Занятость на {date}</h3>
            {booked.length === 0 ? (
              <p className="occupancy__free">Свободно весь день 🎉</p>
            ) : (
              <ul>
                {booked.map((b, idx) => (
                  <li key={idx}>
                    {formatTime(b.start_time)} — {formatTime(b.end_time)}
                    <span className="occupancy__tag">занято</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
