'use client'

import { useState, useMemo, useEffect } from 'react'

type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  categoria: string | null
  activo: boolean
  stock?: number
  created_at?: string
}

const POR_PAGINA = 25

function formatearPrecio(v: number): string {
  return '$' + Number(v || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function TablaProductos({
  productos,
  onEditar,
  onRecargar,
}: {
  productos: Producto[]
  onEditar: (p: Producto) => void
  onRecargar: () => Promise<void>
}) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [soloSinPrecio, setSoloSinPrecio] = useState(false)
  const [pagina, setPagina] = useState(1)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [valorPrecio, setValorPrecio] = useState('')
  const [guardandoId, setGuardandoId] = useState<string | null>(null)

  const categorias = useMemo(
    () => [...new Set(productos.map(p => p.categoria).filter((c): c is string => !!c && c.trim() !== ''))].sort(),
    [productos]
  )

  const sinPrecioTotal = useMemo(() => productos.filter(p => !p.precio || p.precio <= 0).length, [productos])

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return productos.filter(p => {
      if (q && !(p.nombre.toLowerCase().includes(q) || (p.categoria?.toLowerCase().includes(q)))) return false
      if (categoriaFiltro !== 'Todas' && (p.categoria || '') !== categoriaFiltro) return false
      if (estadoFiltro === 'activos' && !p.activo) return false
      if (estadoFiltro === 'inactivos' && p.activo) return false
      if (soloSinPrecio && p.precio > 0) return false
      return true
    })
  }, [productos, busqueda, categoriaFiltro, estadoFiltro, soloSinPrecio])

  useEffect(() => { setPagina(1) }, [busqueda, categoriaFiltro, estadoFiltro, soloSinPrecio])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const desde = (pagina - 1) * POR_PAGINA
  const pageItems = filtrados.slice(desde, desde + POR_PAGINA)

  function abrirEdicionPrecio(p: Producto) {
    setEditandoId(p.id)
    setValorPrecio(p.precio ? String(p.precio) : '')
  }

  async function guardarPrecio(p: Producto) {
    const nuevo = parseInt(valorPrecio.replace(/\D/g, ''), 10) || 0
    if (nuevo === p.precio) { setEditandoId(null); return }
    setGuardandoId(p.id)
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: nuevo,
          imagen_url: p.imagen_url || '',
          categoria: p.categoria || '',
          activo: p.activo,
        }),
      })
      if (!res.ok) throw new Error()
      await onRecargar()
    } catch {
      alert('No se pudo guardar el precio')
    } finally {
      setGuardandoId(null)
      setEditandoId(null)
    }
  }

  return (
    <div>
      {/* BARRA DE HERRAMIENTAS */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full border border-[#CBD5E1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#12283F] focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm text-[#12283F] bg-white focus:outline-none focus:ring-2 focus:ring-[#12283F]"
        >
          <option value="Todas">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
          className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm text-[#12283F] bg-white focus:outline-none focus:ring-2 focus:ring-[#12283F]"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <button
          type="button"
          onClick={() => setSoloSinPrecio(v => !v)}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold border transition-colors ${
            soloSinPrecio ? 'bg-amber-500 text-white border-amber-500' : 'border-[#CBD5E1] text-[#12283F] hover:bg-[#F5F7FA]'
          }`}
        >
          Sin precio ({sinPrecioTotal})
        </button>
      </div>

      <p className="text-xs text-[#64748B] mb-3">
        {filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}
        {filtrados.length !== productos.length && ` de ${productos.length}`}
      </p>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[10px] uppercase tracking-wide text-[#94A3B8]">
                <th className="text-left font-bold px-4 py-3 w-[46%]">Producto</th>
                <th className="text-left font-bold px-4 py-3">Stock</th>
                <th className="text-left font-bold px-4 py-3">Estado</th>
                <th className="text-left font-bold px-4 py-3">Precio</th>
                <th className="text-right font-bold px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(p => (
                <tr key={p.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-md bg-[#F5F7FA] overflow-hidden border border-[#E2E8F0]">
                        {p.imagen_url
                          ? <img src={p.imagen_url} alt="" className="h-full w-full object-cover" />
                          : <span className="flex h-full w-full items-center justify-center text-[8px] text-[#94A3B8]">S/F</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#12283F] truncate max-w-[280px]">{p.nombre}</p>
                        {p.categoria && <p className="text-[11px] text-[#94A3B8] truncate">{p.categoria}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#64748B]">
                    {typeof p.stock === 'number' ? p.stock : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {editandoId === p.id ? (
                      <input
                        autoFocus
                        inputMode="numeric"
                        value={valorPrecio}
                        onChange={(e) => setValorPrecio(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => guardarPrecio(p)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarPrecio(p)
                          if (e.key === 'Escape') setEditandoId(null)
                        }}
                        className="w-24 border border-[#12283F] rounded px-2 py-1 text-sm focus:outline-none"
                        placeholder="0"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => abrirEdicionPrecio(p)}
                        disabled={guardandoId === p.id}
                        className={`font-bold rounded px-2 py-1 transition-colors ${
                          !p.precio || p.precio <= 0
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-[#12283F] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        {guardandoId === p.id ? '...' : (!p.precio || p.precio <= 0 ? 'Poner precio' : formatearPrecio(p.precio))}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditar(p)}
                      className="text-xs font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-3 py-1.5 hover:bg-[#F5F7FA] transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#64748B]">
                    No hay productos con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-white disabled:opacity-40 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#64748B]">Página {pagina} de {totalPaginas}</span>
          <button
            type="button"
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-white disabled:opacity-40 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}