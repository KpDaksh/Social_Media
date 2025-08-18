import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // while auth state is initializing, avoid redirect flicker
    return <div className="text-center p-6">Loading...</div>
  }

  if (!isAuthenticated) {
    // redirect to login page, preserve attempted location
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
