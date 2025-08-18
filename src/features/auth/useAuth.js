import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { clearUser, setLoading } from '../../store/authSlice'

export default function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const loading = useSelector((s) => s.auth.loading)

  const logout = async () => {
    dispatch(setLoading(true))
    try {
      await signOut(auth)
      // onAuthStateChanged will clear user, but dispatch here for immediacy
      dispatch(clearUser())
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return { user, isAuthenticated, loading, logout }
}
