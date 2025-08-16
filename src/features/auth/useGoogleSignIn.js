import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function useGoogleSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const isNewUser = result?.additionalUserInfo?.isNewUser || false
      const additionalUserInfo = result?.additionalUserInfo || null

      // create or update user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'google',
        lastLogin: new Date().toISOString(),
      }, { merge: true })

      setLoading(false)
      return { user, isNewUser, additionalUserInfo }
    } catch (err) {
      // handle account-exists-with-different-credential
      try {
        if (err.code === 'auth/account-exists-with-different-credential' || err.code === 'auth/account-exists-with-different-credential') {
          const email = err.customData?.email || err.email || null
          if (email) {
            const methods = await fetchSignInMethodsForEmail(auth, email)
            setError({
              code: err.code,
              message: `This email is already registered using: ${methods.join(', ')}. Please sign in using that provider and link accounts.`,
            })
            setLoading(false)
            return { user: null, isNewUser: false }
          }
        }
      } catch (inner) {
        // ignore
      }

      setError(err)
      setLoading(false)
      return { user: null, isNewUser: false }
    }
  }

  return { signInWithGoogle, loading, error }
}
