import React, { useState } from 'react'
import useLogin from './useLogin'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useGoogleSignIn from './useGoogleSignIn'
import { updatePassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../services/firebase'

const Login = () => {
  const { login, error, loading } = useLogin()
  const { signInWithGoogle, loading: gLoading, error: gError } = useGoogleSignIn()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/profile'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = await login(form)
  if (user) navigate(from, { replace: true })
  }

  const handleGoogle = async () => {
    console.log('handleGoogle clicked')
    try {
      const res = await signInWithGoogle()
      console.log('Google sign-in response:', res)
      if (!res) return
      const { user, isNewUser, additionalUserInfo } = res

      // log user metadata if present
      console.log('Google user metadata:', user?.metadata)

      // Robust detection: prefer provider's isNewUser flag, fall back to additionalUserInfo, then to metadata timestamps
      const createdAt = user?.metadata?.creationTime
      const lastSignIn = user?.metadata?.lastSignInTime
      const metadataIndicatesNew = createdAt && lastSignIn && createdAt === lastSignIn
      const newUserDetected = (isNewUser === true) || (additionalUserInfo?.isNewUser === true) || metadataIndicatesNew

      if (newUserDetected) {
        console.log('Detected new Google user; showing set-password modal')
        setShowSetPassword(true)
        setPasswordError(null)
        setPasswordSuccess(null)
        return
      }

      if (user) {
  navigate(from, { replace: true })
      }
    } catch (e) {
      console.error('handleGoogle error:', e)
    }
  }

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters.'
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one number.'
    if (!/[A-Z]/.test(pwd)) return 'Password should include at least one uppercase letter.'
    if (!/[!@#$%^&*]/.test(pwd)) return 'Password should include at least one special character (!@#$%^&*).'
    return null
  }

  const handleSetPassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)

    const validationError = validatePassword(newPassword)
    if (validationError) {
      setPasswordError(validationError)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.")
      return
    }

    setSettingPassword(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      // send verification email
      try {
        await sendEmailVerification(auth.currentUser)
        setPasswordSuccess('Password saved. A verification email has been sent to your address.')
      } catch {
        // verification email failed, still proceed
        setPasswordSuccess('Password saved. (Failed to send verification email)')
      }
      setSettingPassword(false)
      // keep modal open to show success, or auto-close after a delay
      setTimeout(() => {
        setShowSetPassword(false)
  navigate(from, { replace: true })
      }, 1400)
    } catch (err) {
      setSettingPassword(false)
      setPasswordError(err.message || 'Failed to set password. Try again.')
    }
  }

  // convert firebase errors into friendly messages
  const getFriendlyError = (err) => {
    if (!err) return null
    const codeOrMessage = (typeof err === 'string') ? err : (err.code || err.message || JSON.stringify(err))
    const lower = String(codeOrMessage).toLowerCase()

    if (lower.includes('user-not-found')) return 'No account found for this email. Please sign up.'
    if (lower.includes('invalid-credential')) return "Account doesn't exist or invalid credentials. Please check and try again."
    if (lower.includes('wrong-password')) return 'Incorrect password. Please try again.'
    if (lower.includes('invalid-email')) return 'Please enter a valid email address.'
    if (lower.includes('too-many-requests')) return 'Too many attempts. Please try again later.'
    if (lower.includes('user-disabled')) return 'This account has been disabled.'

    return (typeof err === 'string') ? err : (err.message || JSON.stringify(err))
  }

  const friendlyError = getFriendlyError(error || gError)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1116]">
      <div className="w-full max-w-sm p-8">
        <div className="relative bg-gradient-to-b from-[#0a0b10] to-[#0f1116] border border-gray-800 rounded-2xl shadow-2xl p-6">
          {/* subtle large backdrop rounded panel */}
          <div className="absolute -inset-y-6 -inset-x-6 bg-gradient-to-br from-[#0b0811]/30 via-transparent to-[#0f0b14]/40 rounded-3xl blur-xl opacity-40 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white text-2xl font-bold">Log In</div>
              <Link to="/signup" className="text-sm text-gray-400 hover:text-white">Sign Up</Link>
            </div>

            <hr className="border-gray-800 mb-6" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {friendlyError && <div className="text-sm text-red-400 mt-2">{friendlyError}</div>}

              {/* Google sign-in */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={gLoading}
                  className="w-full py-3 rounded-xl bg-white/5 border border-gray-700 text-white flex items-center justify-center gap-3 hover:bg-white/7 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.9 0 7.2 1.4 9.9 3.6l7.4-7.4C36.6 2 30.6 0 24 0 14.5 0 6.6 5.4 2.6 13l8.8 6.8C13.9 14.5 18.5 9.5 24 9.5z"/><path fill="#34A853" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.9c-.6 3.2-2.6 6-5.6 7.9l8.6 6C44 38.9 46.9 32.4 46.9 24.5z"/><path fill="#4A90E2" d="M10.2 28.8c-1-2.9-1-6 0-8.8L1.4 13C-1 19.4-1 29.6 1.4 36l8.8-7.2z"/><path fill="#FBBC05" d="M24 48c6.6 0 12.6-2 17.3-5.5l-8.6-6c-2.4 1.6-5.3 2.6-8.7 2.6-5.4 0-10-4.8-11.4-11.2L2.6 35C6.6 42.6 14.5 48 24 48z"/></svg>
                  {gLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
                {gError && <div className="text-sm text-red-400 mt-2">{gError.message || gError}</div>}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mt-3">
                <button type="button" onClick={() => { setShowResetPassword(true); setResetEmail(form.email || '') }} className="hover:underline">Forgot password?</button>
                <Link to="/signup" className="text-blue-400 hover:underline">Create account</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Reset password modal */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-[#0b0d12] p-6 rounded-lg border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-3">Reset your password</h3>
            <p className="text-gray-400 text-sm mb-4">Enter your account email and we'll send a password reset link.</p>

            <input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 mb-3"
            />
            {resetError && <div className="text-red-400 text-sm mb-2">{resetError}</div>}
            {passwordSuccess && <div className="text-green-400 text-sm mb-2">{passwordSuccess}</div>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetPassword(false)} className="px-4 py-2 rounded bg-gray-700 text-white">Cancel</button>
              <button
                onClick={async () => {
                  setResetError(null)
                  setPasswordSuccess(null)
                  if (!resetEmail) {
                    setResetError('Please enter your email address.')
                    return
                  }
                  setResetLoading(true)
                  try {
                    await sendPasswordResetEmail(auth, resetEmail)
                    setPasswordSuccess('Password reset email sent. Check your inbox.')
                    setResetLoading(false)
                    // keep modal open briefly to show message
                    setTimeout(() => setShowResetPassword(false), 1400)
                  } catch (err) {
                    setResetLoading(false)
                    const msg = err?.message || 'Failed to send reset email. Try again.'
                    setResetError(msg)
                  }
                }}
                disabled={resetLoading}
                className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              >
                {resetLoading ? 'Sending...' : 'Send reset email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set password modal for new Google users */}
      {showSetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-[#0b0d12] p-6 rounded-lg border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-3">Set a password for your account</h3>
            <p className="text-gray-400 text-sm mb-4">You signed up with Google. Set a password so you can sign in with your email and password later.</p>

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 mb-3"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-[#0f1620] text-gray-200 placeholder-gray-500 border border-gray-800 mb-3"
            />
            {passwordError && <div className="text-red-400 text-sm mb-2">{passwordError}</div>}
            {passwordSuccess && <div className="text-green-400 text-sm mb-2">{passwordSuccess}</div>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowSetPassword(false)} className="px-4 py-2 rounded bg-gray-700 text-white">Cancel</button>
              <button onClick={handleSetPassword} disabled={settingPassword} className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                {settingPassword ? 'Saving...' : 'Set password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login