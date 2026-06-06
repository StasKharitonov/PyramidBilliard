export function Loader({ label = 'Загрузка…' }) {
  return (
    <div className="state state--loading">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Не удалось загрузить данные.', onRetry }) {
  return (
    <div className="state state--error">
      <p>⚠️ {message}</p>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Здесь пока пусто.', children }) {
  return (
    <div className="state state--empty">
      <p>{message}</p>
      {children}
    </div>
  )
}
