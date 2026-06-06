import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { Loader } from './States'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Проверяем авторизацию…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
