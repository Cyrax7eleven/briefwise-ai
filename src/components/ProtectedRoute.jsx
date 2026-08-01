import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="mt-16 text-center text-slate-400">Loading…</p>
  if (!user) return <Navigate to="/login" replace />

  return children
}
