'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'

// Botones de acceso rápido
const BOTONES_RAPIDOS = [
  'OLD SCHOOL',
  'STREET',
  'PELUQUERAS',
  'AFEITADORAS',
  'CERAS',
  'PLANCHAS',
  'SECADORES',
  'TODA LA TIENDA'
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
  {
    id: 'electricos',
    nombre: 'Eléctricos',
    categorias: [
      'Peluqueras',
      'Patilleras',
      'Afeitadoras',
      'Trimmers de Nariz',
      'Secadores',
      'Secadores y cepillo secador',
      'Rizadoras, pinzas y conos',
      'Planchas'
    ]
  },
  {
    id: 'manuales',
    nombre: 'Manuales',
    categorias: [
      'Tijeras',
      'Barberas y Minoras',
      'Cabezotes',
      'Guias de Corte'
    ]
  },
  {
    id: 'cuidado',
    nombre: 'Cuidado y Estilizado',
    categorias: [
      'Ceras',
      'Geles, balsamos y cremas de peinar',
      'Lacas',
      'Shampoos y Acondicionadores',
      'Keratinas, serums y tratamientos capilares',
      'Voluminizantes',
      'Pigmentos, fibras, tintes y aerografos'
    ]
  },
  {
    id: 'aseo',
    nombre: 'Aseo y Protección',
    categorias: [
      'After Shave',
      'Shaving Gel',
      'Talcos',
      'Cremas, exfoliantes y vaselinas',
      'Mascarillas, velos y tratamientos faciales',
      'Barba',
      'Tatuajes'
    ]
  },
  {
    id: 'accesorios',
    nombre: 'Accesorios y Puesto',
    categorias: [
      'Capas',
      'Cuelleros, toallas y paños',
      'Atomizadores, pulverizadores y sprays',
      'Brochas, talqueras y sacudidores',
      'Peinillas',
      'Cepillos',
      'Tapetes, bases y puesto de trabajo',
      'Caimanes, pinzas y sujetadores',
      'Maletas, gorras y accesorios'
    ]
  },
  {
    id: 'repuestos',
    nombre: 'Repuestos y Mantenimiento',
    categorias: [
      'Repuestos',
      'Lubricantes, Aceites y Mantenimiento'
    ]
  },
  {
    id: 'combos',
    nombre: 'Combos y Kits',
    categorias: ['Combos']
  },
  {
    id: 'otros',
    nombre: 'Otros',
    categorias: [
      'Otros',
      'Remates',
      'Minoxidil',
      'Ollas de cera y depilacion',
      'Pulidores, drill y uñas',
      'Cortadoras'
    ]
  }
]

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
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const seccionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase
        .from('productos')
        .select('marca')
        .not('marca', 'is', null)
        .not('marca', 'eq', '')

      if (data) {
        const marcasUnicas = [...new Set(data.map(p => p.marca))].filter(Boolean)
        setMarcas(marcasUnicas.sort())
      }
    }

    cargarMarcas()
  }, [])

  const marcasDestacadas = [
    'Babyliss',
    'JRL',
    'Reuzel',
    'Stylecraft',
    'Street',
    'Turbox',
    'Old School',
    'Wahl',
    'Very Secret'
  ]

  const marcasFiltradas = marcasDestacadas.filter(m =>
    marcas.some(marca => marca.toLowerCase() === m.toLowerCase())
  )

  const handleSeccionClick = (seccionId: string | null) => {
    if (onSeccionChange) onSeccionChange(seccionId)
    if (onCategoriaChange) onCategoriaChange('Todas')
    setSeccionHover(null)
  }

  const handleCategoriaClick = (categoria: string) => {
    onCategoriaChange?.(categoria)
    setMarcasDropdownAbierto(false)
    setSeccionHover(null)
  }

  const handleMouseEnterMarcas = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMarcasDropdownAbierto(true)
  }

  const handleMouseLeaveMarcas = () => {
    timeoutRef.current = setTimeout(() => {
      setMarcasDropdownAbierto(false)
    }, 150)
  }

  const handleMouseEnterSeccion = (id: string) => {
    if (seccionTimeoutRef.current) clearTimeout(seccionTimeoutRef.current)
    setSeccionHover(id)
  }

  const handleMouseLeaveSeccion = () => {
    seccionTimeoutRef.current = setTimeout(() => {
      setSeccionHover(null)
    }, 150)
  }

  return (
    <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">

      {/* BOTONES DE ACCESO RÁPIDO */}
      <div className="relative border-b border-[#E2E8F0]">
        <div
          className="
            max-w-7xl mx-auto
            px-4 py-3 sm:py-5
            flex items-center
            gap-3 sm:gap-5 md:gap-6
            overflow-x-auto
            overflow-y-hidden
            flex-nowrap
            scroll-smooth
            snap-x snap-mandatory
            scrollbar-hide
            sm:justify-center
          "
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {BOTONES_RAPIDOS.map((boton) => {
            const icono = ICONOS_BOTONES[boton]
            if (icono) {
              const activo = categoriaActiva === boton
              return (
                <button
                  key={boton}
                  onClick={() => onCategoriaChange?.(boton)}
                  className={`
                    shrink-0 snap-start
                    flex flex-col items-center
                    gap-1.5
                    rounded-xl
                    px-2 sm:px-3
                    py-1.5 sm:py-2
                    transition-all
                    ${activo ? 'bg-[#12283F]/[0.06] ring-1 ring-[#12283F]/30' : 'hover:bg-[#F5F7FA]'}
                  `}
                  aria-label={`Ver categoría ${boton}`}
                >
                  <span className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border border-[#E2E8F0] bg-white shadow-sm">
                    <img src={icono} alt={boton} className="h-full w-full object-cover" />
                  </span>
                  <span className={`whitespace-nowrap text-[9px] sm:text-[10px] font-bold tracking-wide ${activo ? 'text-[#12283F]' : 'text-[#64748B]'}`}>
                    {boton}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={boton}
                onClick={() => onCategoriaChange?.(boton)}
                className={`
                  shrink-0 whitespace-nowrap px-3 py-1 text-[10px] font-bold tracking-wide rounded-full transition-all
                  ${categoriaActiva === boton ? 'bg-[#12283F] text-white' : 'text-[#64748B] hover:bg-[#F5F7FA]'}
                `}
              >
                {boton}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECCIONES Y MARCAS */}
      <div className="max-w-7xl mx-auto px-4 py-2 relative">
        <div className="flex flex-nowrap items-center justify-between">
          
          <div className="flex flex-nowrap items-center gap-1 overflow-visible pb-2">
            <button
              onClick={() => handleSeccionClick(null)}
              className={`
                shrink-0 px-3 py-1 text-xs font-semibold rounded-lg transition-all
                ${seccionActiva === null ? 'bg-[#12283F] text-white' : 'text-[#64748B] hover:bg-[#F5F7FA]'}
              `}
            >
              Todos
            </button>

            {SECCIONES.map((seccion) => {
              const abierto = seccionHover === seccion.id

              return (
                <div
                  key={seccion.id}
                  className="relative shrink-0"
                  onMouseEnter={() => handleMouseEnterSeccion(seccion.id)}
                  onMouseLeave={handleMouseLeaveSeccion}
                >
                  <button
                    onClick={() => handleSeccionClick(seccion.id)}
                    className={`
                      shrink-0 whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-lg transition-all
                      ${seccionActiva === seccion.id ? 'bg-[#12283F] text-white' : 'text-[#64748B] hover:bg-[#F5F7FA]'}
                    `}
                  >
                    {seccion.nombre}
                  </button>

                  {abierto && (
                    <div className="absolute left-0 top-full pt-1 z-50">
                      <div className="min-w-[220px] rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-xl">
                        {seccion.categorias.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoriaClick(cat)}
                            className={`
                              block w-full rounded px-3 py-1.5 text-left text-xs transition-colors
                              ${categoriaActiva === cat ? 'bg-[#F5F7FA] font-semibold text-[#12283F]' : 'text-[#64748B] hover:bg-[#F5F7FA]'}
                            `}
                          >
                            {cat}
                          </button>
                        ))}
                        <button
                          onClick={() => handleSeccionClick(seccion.id)}
                          className="mt-1 block w-full rounded border-t border-[#E2E8F0] px-3 py-1.5 text-left text-xs font-semibold text-[#12283F] transition-colors hover:bg-[#F5F7FA]"
                        >
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
            <div 
              className="relative group ml-2 shrink-0"
              onMouseEnter={handleMouseEnterMarcas}
              onMouseLeave={handleMouseLeaveMarcas}
            >
              <button
                onClick={() => setMarcasDropdownAbierto(!marcasDropdownAbierto)}
                className="whitespace-nowrap px-3 py-1 text-xs font-medium text-[#64748B] hover:bg-[#F5F7FA] rounded-full transition-colors flex items-center gap-1"
              >
                Marcas <span className="text-[10px]">▼</span>
              </button>

              {marcasDropdownAbierto && (
                <div className="absolute right-0 top-full pt-1 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-[#E2E8F0] p-1 min-w-[140px]">
                    {marcasFiltradas.map((marca) => (
                      <button
                        key={marca}
                        onClick={() => handleCategoriaClick(marca)}
                        className="block w-full text-left px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F5F7FA] rounded transition-colors"
                      >
                        {marca}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCategoriaClick('Todas')}
                      className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-[#12283F] hover:bg-[#F5F7FA] rounded transition-colors border-t border-[#E2E8F0] mt-1 pt-1.5"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}