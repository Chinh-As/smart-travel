/**
 * useRequireAuth — Guard hook that redirects to /login if user is not authenticated.
 * Usage:
 *   const requireAuth = useRequireAuth()
 *   requireAuth(() => doSomething())   // will only run if logged in
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function useRequireAuth() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * @param {Function} action - callback to run if logged in
   */
  const requireAuth = (action) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } })
      return false
    }
    if (typeof action === 'function') action()
    return true
  }

  return requireAuth
}
