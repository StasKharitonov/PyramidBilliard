import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'info') => {
      idCounter += 1
      const id = idCounter
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.type}`}
            role="status"
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
