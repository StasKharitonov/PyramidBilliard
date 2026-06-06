import { useEffect, useState } from 'react'

import { getTournaments } from '../api/tournaments'
import TournamentCard from '../components/TournamentCard'
import { EmptyState, ErrorState, Loader } from '../components/States'

const FILTERS = [
  { value: '', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'active', label: 'Идут сейчас' },
  { value: 'finished', label: 'Завершённые' },
]

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async (status) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTournaments(status)
      setTournaments(data)
    } catch {
      setError('Не удалось загрузить турниры.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter)
  }, [filter])

  return (
    <div className="container section">
      <header className="page-head">
        <h1>Турниры</h1>
        <p>Соревнуйтесь, побеждайте и забирайте призы.</p>
      </header>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter ${filter === f.value ? 'filter--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Загружаем турниры…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(filter)} />
      ) : tournaments.length === 0 ? (
        <EmptyState message="Турниров по этому фильтру пока нет." />
      ) : (
        <div className="grid grid--cards">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  )
}
