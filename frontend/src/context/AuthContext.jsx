import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { getProfile, loginApi, registerApi } from '../api/auth'
import { setLogoutHandler, tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  // Let the axios client trigger a logout when token refresh fails.
  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  const loadProfile = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null)
      setLoading(false)
      return null
    }
    try {
      const data = await getProfile()
      setUser(data)
      return data
    } catch {
      tokenStore.clear()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Restore the session on first load (if a token is present).
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(
    async (payload) => {
      await registerApi(payload)
      return login(payload.email, payload.password)
    },
    [login],
  )

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile: loadProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
