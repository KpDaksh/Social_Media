import React, { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { useDispatch } from 'react-redux'
import { setUser, clearUser, setLoading } from '../../store/authSlice'

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setLoading(true))
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // minimal user object to store in redux
        const safeUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified || false,
        }
        dispatch(setUser(safeUser))
      } else {
        dispatch(clearUser())
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}

export default AuthProvider
