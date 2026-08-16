'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setCargando(false)

    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl border border-neutral-200 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-neutral-900 mb-6">
          Panel Barberworld
        </h1>

        <label className="block text-sm text-neutral-600 mb-1">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-neutral-800"
        />

        <label className="block text-sm text-neutral-600 mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-neutral-800"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-neutral-900 text-white py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}