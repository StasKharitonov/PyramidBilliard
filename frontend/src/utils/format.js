export function formatPrice(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₽`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(value) {
  // Time fields come back as "HH:MM:SS".
  return value ? value.slice(0, 5) : ''
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const TABLE_TYPE_LABELS = {
  russian_pool: 'Русский бильярд',
  american_pool: 'Американский пул',
  snooker: 'Снукер',
}
