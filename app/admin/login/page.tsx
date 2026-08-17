'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setCargando(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Correo o contraseña incorrectos.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error(error)
      setError('Ocurrió un error al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">

          {/* LOGO / ENCABEZADO */}
          <div className="px-8 pt-10 pb-8 text-center border-b border-[#F1F5F9]">
            <div className="relative w-24 h-24 mx-auto mb-5">
              <Image
                src="/logo.png"
                alt="Barberworld"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>

            <h1
              className="text-3xl text-[#12283F] tracking-wide leading-none"
              style={{
                fontFamily: 'var(--font-display)',
              }}
            >
              BARBERWORLD
            </h1>

            <p className="text-sm text-[#64748B] mt-2">
              Panel de administración
            </p>
          </div>

          {/* FORMULARIO */}
          <form
            onSubmit={handleLogin}
            className="p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#12283F]">
                Iniciar sesión
              </h2>

              <p className="text-sm text-[#64748B] mt-1">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            {/* EMAIL */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#334155] mb-1.5"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@barberworld.com"
                autoComplete="email"
                required
                className="w-full border border-[#CBD5E1] rounded-lg px-4 py-3 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#334155] mb-1.5"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full border border-[#CBD5E1] rounded-lg px-4 py-3 pr-20 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(!mostrarPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#12283F]"
                >
                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#12283F] text-white font-semibold rounded-lg px-5 py-3 hover:bg-[#1C3D5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            <p className="text-center text-xs text-[#94A3B8] mt-6">
              Acceso exclusivo para administración
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6">
          © {new Date().getFullYear()} Barberworld
        </p>
      </div>
    </main>
  )
}