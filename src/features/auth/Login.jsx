import React, { useState } from 'react'
import useLogin from './useLogin'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const { login, error, loading } = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = await login(form)
    if (user) {
      navigate('/profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-gray-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="white" opacity="0.95" />
              <path d="M4 20c0-3.314 4.03-6 8-6s8 2.686 8 6v1H4v-1z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <h2 className="mt-4 text-white text-2xl font-semibold">Welcome back</h2>
          <p className="text-gray-400 text-sm">Sign in to continue to Social</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Sign in'}
          </button>

          {error && <div className="mt-2 text-sm text-red-400">{error}</div>}

          <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
            <Link to="/signup" className="text-blue-400 hover:underline">Create account</Link>
            <Link to="/forgot" className="hover:underline">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login