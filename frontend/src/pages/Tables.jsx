import { useEffect, useState } from 'react'

import { getTables } from '../api/tables'
import TableCard from '../components/TableCard'
import { EmptyState, ErrorState, Loader } from '../components/States'

const FILTERS = [
  { value: '', label: 'Все столы' },
  { value: 'russian_pool', label: 'Русский бильярд' },
]

export default function Tables() {
  const [tables, setTables] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async (type) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTables(type)
      setTables(data)
    } catch {
      setError('Не удалось загрузить список столов.')
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
        <h1>Бильярдные столы</h1>
        <p>Выберите стол по душе и забронируйте удобное время.</p>
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
        <Loader label="Загружаем столы…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(filter)} />
      ) : tables.length === 0 ? (
        <EmptyState message="По выбранному фильтру столов не найдено." />
      ) : (
        <div className="grid grid--cards">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  )
}
