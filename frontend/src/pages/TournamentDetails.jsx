import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { extractError } from '../api/client'
import {
  getTournament,
  registerTournament,
  unregisterTournament,
} from '../api/tournaments'
import { ErrorState, Loader } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate, formatPrice, formatTime } from '../utils/format'

export default function TournamentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { notify } = useToast()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [working, setWorking] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getTournament(id)
      .then(setTournament)
      .catch(() => setError('Турнир не найден.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleRegister = async () => {
    if (!isAuthenticated) {
      notify('Войдите, чтобы зарегистрироваться на турнир', 'info')
      navigate('/login', { state: { from: `/tournaments/${id}` } })
      return
    }
    setWorking(true)
    try {
      const data = await registerTournament(id)
      setTournament(data)
      notify('Вы зарегистрированы на турнир!', 'success')
    } catch (err) {
      notify(extractError(err, 'Не удалось зарегистрироваться'), 'error')
    } finally {
      setWorking(false)
    }
  }

  const handleUnregister = async () => {
    setWorking(true)
    try {
      const data = await unregisterTournament(id)
      setTournament(data)
      notify('Регистрация отменена', 'info')
    } catch (err) {
      notify(extractError(err, 'Не удалось отменить регистрацию'), 'error')
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Загружаем турнир…" />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="container section">
        <ErrorState message={error || 'Турнир не найден.'} />
        <div className="center">
          <Link to="/tournaments" className="btn btn--ghost">
            ← Ко всем турнирам
          </Link>
        </div>
      </div>
    )
  }

  const closed = ['finished', 'cancelled'].includes(tournament.status)

  return (
    <div className="container section">
      <Link to="/tournaments" className="back-link">
        ← Ко всем турнирам
      </Link>

      <div className="grid grid--split detail">
        <div className="detail__hero detail__hero--tournament">
          <span className={`status status--${tournament.status}`}>
            {tournament.status_display}
          </span>
          <h1>{tournament.title}</h1>
          <p>{tournament.description}</p>
          <div className="detail__prize">🏆 {tournament.prize}</div>
        </div>

        <div className="panel">
          <h2>Информация</h2>
          <ul className="meta-list meta-list--lg">
            <li>
              <span>Дата</span>
              <strong>{formatDate(tournament.date)}</strong>
            </li>
            <li>
              <span>Начало</span>
              <strong>{formatTime(tournament.start_time)}</strong>
            </li>
            <li>
              <span>Взнос за участие</span>
              <strong>{formatPrice(tournament.entry_fee)}</strong>
            </li>
            <li>
              <span>Участников</span>
              <strong>
                {tournament.participants_count}/{tournament.max_participants}
              </strong>
            </li>
            <li>
              <span>Свободно мест</span>
              <strong>{tournament.spots_left}</strong>
            </li>
          </ul>

          {tournament.is_registered ? (
            <>
              <div className="alert alert--success">
                Вы зарегистрированы на этот турнир.
              </div>
              <button
                className="btn btn--ghost btn--block"
                onClick={handleUnregister}
                disabled={working}
              >
                {working ? 'Отменяем…' : 'Отменить регистрацию'}
              </button>
            </>
          ) : closed ? (
            <div className="alert alert--muted">
              Регистрация на этот турнир закрыта.
            </div>
          ) : tournament.is_full ? (
            <div className="alert alert--muted">
              Свободных мест больше нет.
            </div>
          ) : (
            <button
              className="btn btn--gold btn--block"
              onClick={handleRegister}
              disabled={working}
            >
              {working
                ? 'Регистрируем…'
                : isAuthenticated
                  ? 'Зарегистрироваться'
                  : 'Войти и зарегистрироваться'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
