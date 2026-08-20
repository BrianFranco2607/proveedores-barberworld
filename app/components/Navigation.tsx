'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'

const BOTONES_RAPIDOS = [
  'OLD SCHOOL', 'STREET', 'PELUQUERAS', 'AFEITADORAS',
  'CERAS', 'PLANCHAS', 'SECADORES', 'TODA LA TIENDA'
]

const ICONOS_BOTONES: Record<string, string> = {
  'OLD SCHOOL': '/Oldschool.png',
  'STREET': '/Street.png',
  'PELUQUERAS': '/Peluqueras.png',
  'AFEITADORAS': '/afeitadoras.png',
  'CERAS': '/Ceras.png',
  'PLANCHAS': '/Planchas.png',
  'SECADORES': '/Secadores.png',
  'TODA LA TIENDA': '/Todalatienda.png',
}

const SECCIONES = [
  { id: 'electricos', nombre: 'Eléctricos', categorias: ['Peluqueras', 'Patilleras', 'Afeitadoras', 'Trimmers de Nariz', 'Secadores', 'Secadores y cepillo secador', 'Rizadoras, pinzas y conos', 'Planchas'] },
  { id: 'manuales', nombre: 'Manuales', categorias: ['Tijeras', 'Barberas y Minoras', 'Cabezotes', 'Guias de Corte'] },
  { id: 'cuidado', nombre: 'Cuidado y Estilizado', categorias: ['Ceras', 'Geles, balsamos y cremas de peinar', 'Lacas', 'Shampoos y Acondicionadores', 'Keratinas, serums y tratamientos capilares', 'Voluminizantes', 'Pigmentos, fibras, tintes y aerografos'] },
  { id: 'aseo', nombre: 'Aseo y Protección', categorias: ['After Shave', 'Shaving Gel', 'Talcos', 'Cremas, exfoliantes y vaselinas', 'Mascarillas, velos y tratamientos faciales', 'Barba', 'Tatuajes'] },
  { id: 'accesorios', nombre: 'Accesorios y Puesto', categorias: ['Capas', 'Cuelleros, toallas y paños', 'Atomizadores, pulverizadores y sprays', 'Brochas, talqueras y sacudidores', 'Peinillas', 'Cepillos', 'Tapetes, bases y puesto de trabajo', 'Caimanes, pinzas y sujetadores', 'Maletas, gorras y accesorios'] },
  { id: 'repuestos', nombre: 'Repuestos y Mantenimiento', categorias: ['Repuestos', 'Lubricantes, Aceites y Mantenimiento'] },
  { id: 'combos', nombre: 'Combos y Kits', categorias: ['Combos'] },
  { id: 'otros', nombre: 'Otros', categorias: ['Otros', 'Remates', 'Minoxidil', 'Ollas de cera y depilacion', 'Pulidores, drill y uñas', 'Cortadoras'] }
]

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      className={`h-4 w-4 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function Navigation({
  onCategoriaChange,
  categoriaActiva = 'Todas',
  onSeccionChange,
  seccionActiva = null
}: {
  onCategoriaChange?: (categoria: string) => void
  categoriaActiva?: string
  onSeccionChange?: (seccion: string | null) => void
  seccionActiva?: string | null
}) {
  const [marcas, setMarcas] = useState<string[]>([])
  const [marcasDropdownAbierto, setMarcasDropdownAbierto] = useState(false)
  const [seccionHover, setSeccionHover] = useState<string | null>(null)

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [seccionExpandida, setSeccionExpandida] = useState<string | null>(null)
  const [marcasExpandidas, setMarcasExpandidas] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const seccionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function cargarMarcas() {
      const TAMANO = 1000
      let desde = 0
      const acumulado: string[] = []

      for (;;) {
        const { data } = await supabase
          .from('productos')
          .select('marca')
          .not('marca', 'is', null)
          .not('marca', 'eq', '')
          .range(desde, desde + TAMANO - 1)

        if (!data || data.length === 0) break

        acumulado.push(...data.map(p => p.marca).filter(Boolean))

        if (data.length < TAMANO) break
        desde += TAMANO
      }

      setMarcas([...new Set(acumulado)].sort())
    }
    cargarMarcas()
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuMovilAbierto])

  const marcasDestacadas = ['Babyliss', 'JRL', 'Reuzel', 'Stylecraft', 'Street', 'Turbox', 'Old School', 'Wahl', 'Very Secret']
  const marcasFiltradas = marcasDestacadas.filter(m => marcas.some(marca => marca.toLowerCase() === m.toLowerCase()))

  const cerrarMenuMovil = () => {
    setMenuMovilAbierto(false)
    setSeccionExpandida(null)
    setMarcasExpandidas(false)
  }

  const handleSeccionClick = (seccionId: string | null) => {
    onSeccionChange?.(seccionId)
    onCategoriaChange?.('Todas')
    setSeccionHover(null)
    cerrarMenuMovil()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoriaClick = (categoria: string) => {
    onCategoriaChange?.(categoria)
    setMarcasDropdownAbierto(false)
    setSeccionHover(null)
    cerrarMenuMovil()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMouseEnterMarcas = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMarcasDropdownAbierto(true)
  }
  const handleMouseLeaveMarcas = () => {
    timeoutRef.current = setTimeout(() => setMarcasDropdownAbierto(false), 150)
  }
  const handleMouseEnterSeccion = (id: string) => {
    if (seccionTimeoutRef.current) clearTimeout(seccionTimeoutRef.current)
    setSeccionHover(id)
  }
  const handleMouseLeaveSeccion = () => {
    seccionTimeoutRef.current = setTimeout(() => setSeccionHover(null), 150)
  }

  const etiquetaActiva = seccionActiva
    ? SECCIONES.find(s => s.id === seccionActiva)?.nombre
    : categoriaActiva !== 'Todas' ? categoriaActiva : null

  return (
    <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">

      <div className="relative border-b border-[#E2E8F0]">
        <div
          className="max-w-7xl mx-auto px-4 py-3 sm:py-5 flex items-center gap-3 sm:gap-5 md:gap-6 overflow-x-auto overflow-y-hidden flex-nowrap scroll-smooth snap-x snap-mandatory scrollbar-hide sm:justify-center"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {BOTONES_RAPIDOS.map((boton) => {
            const icono = ICONOS_BOTONES[boton]
            const activo = categoriaActiva === boton
            return (
              <button
                key={boton}
                onClick={() => onCategoriaChange?.(boton)}
                className={`shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 transition-all ${activo ? 'bg-[#12283F]/[0.06] ring-1 ring-[#12283F]/30' : 'hover:bg-[#F5F7FA]'}`}
                aria-label={`Ver categoría ${boton}`}
              >
                <span className="h-14 w-14 sm:h-20 sm:w-20 overflow-hidden rounded-full border border-[#E2E8F0] bg-white shadow-sm">
                  <img src={icono} alt={boton} className="h-full w-full object-cover" />
                </span>
                <span className={`whitespace-nowrap text-[9px] sm:text-[10px] font-bold tracking-wide ${activo ? 'text-[#12283F]' : 'text-[#64748B]'}`}>
                  {boton}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ESCRITORIO */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-2 relative">
        <div className="flex flex-nowrap items-center justify-between">
          <div className="flex flex-nowrap items-center gap-1 overflow-visible pb-2">
            <button
              onClick={() => handleSeccionClick(null)}
              className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${seccionActiva === null ? 'bg-[#12283F] text-white' : 'text-[#64748B] hover:bg-[#F5F7FA]'}`}
            >
              Todos
            </button>
            {SECCIONES.map((seccion) => {
              const abierto = seccionHover === seccion.id
              return (
                <div key={seccion.id} className="relative shrink-0"
                  onMouseEnter={() => handleMouseEnterSeccion(seccion.id)}
                  onMouseLeave={handleMouseLeaveSeccion}>
                  <button
                    onClick={() => handleSeccionClick(seccion.id)}
                    className={`shrink-0 whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-lg transition-all ${seccionActiva === seccion.id ? 'bg-[#12283F] text-white' : 'text-[#64748B] hover:bg-[#F5F7FA]'}`}
                  >
                    {seccion.nombre}
                  </button>
                  {abierto && (
                    <div className="absolute left-0 top-full pt-1 z-50">
                      <div className="min-w-[220px] rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-xl">
                        {seccion.categorias.map((cat) => (
                          <button key={cat} onClick={() => handleCategoriaClick(cat)}
                            className={`block w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${categoriaActiva === cat ? 'bg-[#F5F7FA] font-semibold text-[#12283F]' : 'text-[#64748B] hover:bg-[#F5F7FA]'}`}>
                            {cat}
                          </button>
                        ))}
                        <button onClick={() => handleSeccionClick(seccion.id)}
                          className="mt-1 block w-full rounded border-t border-[#E2E8F0] px-3 py-1.5 text-left text-xs font-semibold text-[#12283F] transition-colors hover:bg-[#F5F7FA]">
                          Ver toda la sección
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {marcasFiltradas.length > 0 && (
            <div className="relative group ml-2 shrink-0" onMouseEnter={handleMouseEnterMarcas} onMouseLeave={handleMouseLeaveMarcas}>
              <button onClick={() => setMarcasDropdownAbierto(!marcasDropdownAbierto)}
                className="whitespace-nowrap px-3 py-1 text-xs font-medium text-[#64748B] hover:bg-[#F5F7FA] rounded-full transition-colors flex items-center gap-1">
                Marcas <span className="text-[10px]">▼</span>
              </button>
              {marcasDropdownAbierto && (
                <div className="absolute right-0 top-full pt-1 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-[#E2E8F0] p-1 min-w-[140px]">
                    {marcasFiltradas.map((marca) => (
                      <button key={marca} onClick={() => handleCategoriaClick(marca)}
                        className="block w-full text-left px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F5F7FA] rounded transition-colors">
                        {marca}
                      </button>
                    ))}
                    <button onClick={() => handleCategoriaClick('Todas')}
                      className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-[#12283F] hover:bg-[#F5F7FA] rounded transition-colors border-t border-[#E2E8F0] mt-1 pt-1.5">
                      Ver Todos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MÓVIL */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button
            onClick={() => setMenuMovilAbierto(true)}
            className="flex items-center gap-2 rounded-lg bg-[#12283F] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Categorías
          </button>

          {etiquetaActiva && (
            <button
              onClick={() => handleSeccionClick(null)}
              className="flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[11px] font-semibold text-[#12283F]"
            >
              <span className="max-w-[150px] truncate">{etiquetaActiva}</span>
              <span className="text-[#64748B]">✕</span>
            </button>
          )}
        </div>
      </div>

      <div
        onClick={cerrarMenuMovil}
        className={`md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${menuMovilAbierto ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-4">
          <span className="text-base font-bold text-[#12283F]">Categorías</span>
          <button onClick={cerrarMenuMovil} className="flex h-9 w-9 items-center justify-center rounded-full text-[#12283F] hover:bg-[#F5F7FA]" aria-label="Cerrar menú">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <button
            onClick={() => handleSeccionClick(null)}
            className={`mb-1 block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors ${seccionActiva === null && categoriaActiva === 'Todas' ? 'bg-[#12283F] text-white' : 'text-[#12283F] hover:bg-[#F5F7FA]'}`}
          >
            Todos los productos
          </button>

          {SECCIONES.map((seccion) => {
            const abierto = seccionExpandida === seccion.id
            return (
              <div key={seccion.id} className="border-b border-[#F1F5F9]">
                <button
                  onClick={() => setSeccionExpandida(abierto ? null : seccion.id)}
                  className="flex w-full items-center justify-between px-3 py-3.5 text-sm font-semibold text-[#12283F]"
                >
                  {seccion.nombre}
                  <Chevron abierto={abierto} />
                </button>
                {abierto && (
                  <div className="pb-2">
                    {seccion.categorias.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoriaClick(cat)}
                        className={`block w-full rounded-lg px-6 py-2.5 text-left text-[13px] transition-colors ${categoriaActiva === cat ? 'bg-[#F5F7FA] font-semibold text-[#12283F]' : 'text-[#64748B] hover:bg-[#F5F7FA]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSeccionClick(seccion.id)}
                      className="mt-1 block w-full px-6 py-2.5 text-left text-xs font-semibold text-[#1C3D5F]"
                    >
                      Ver toda la sección →
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {marcasFiltradas.length > 0 && (
            <div className="border-b border-[#F1F5F9]">
              <button
                onClick={() => setMarcasExpandidas(!marcasExpandidas)}
                className="flex w-full items-center justify-between px-3 py-3.5 text-sm font-semibold text-[#12283F]"
              >
                Marcas
                <Chevron abierto={marcasExpandidas} />
              </button>
              {marcasExpandidas && (
                <div className="pb-2">
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca}
                      onClick={() => handleCategoriaClick(marca)}
                      className="block w-full rounded-lg px-6 py-2.5 text-left text-[13px] text-[#64748B] transition-colors hover:bg-[#F5F7FA]"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
