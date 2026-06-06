import { useEffect, useState } from 'react'

import { getCategories, getItems } from '../api/kitchen'
import FoodCard from '../components/FoodCard'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function Menu() {
  const { addItem } = useCart()
  const { notify } = useToast()

  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const loadItems = async (cat) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getItems(cat)
      setItems(data)
    } catch {
      setError('Не удалось загрузить меню.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems(category)
  }, [category])

  const handleAdd = (item, qty) => {
    addItem(item, qty)
    notify(`«${item.name}» в корзине (${qty} шт.)`, 'success')
  }

  return (
    <div className="container section">
      <header className="page-head">
        <h1>Меню кухни</h1>
        <p>Закажите вкусную еду и напитки прямо к вашему столу.</p>
      </header>

      <div className="filters">
        <button
          className={`filter ${category === '' ? 'filter--active' : ''}`}
          onClick={() => setCategory('')}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`filter ${
              category === String(c.id) ? 'filter--active' : ''
            }`}
            onClick={() => setCategory(String(c.id))}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Загружаем меню…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadItems(category)} />
      ) : items.length === 0 ? (
        <EmptyState message="В этой категории пока нет блюд." />
      ) : (
        <div className="grid grid--cards">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  )
}
