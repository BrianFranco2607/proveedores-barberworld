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

// Íconos de los botones rápidos.
// IMPORTANTE: los nombres deben coincidir EXACTAMENTE
// con los archivos dentro de /public.
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

// Grupos de categorías
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase
        .from('productos')
        .select('marca')
        .not('marca', 'is', null)
        .not('marca', 'eq', '')

      if (data) {
        const marcasUnicas = [...new Set(data.map(p => p.marca))]
          .filter(Boolean)

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
    if (onSeccionChange) {
      onSeccionChange(seccionId)
    }

    if (onCategoriaChange) {
      onCategoriaChange('Todas')
    }
  }

  const handleCategoriaClick = (categoria: string) => {
    onCategoriaChange?.(categoria)
    setMarcasDropdownAbierto(false)
  }

  // Lógica para abrir/cerrar el menú tanto con hover como con click
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMarcasDropdownAbierto(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMarcasDropdownAbierto(false)
    }, 150) // Pequeño retraso para que no se cierre si el mouse se mueve al menú
  }

  const handleButtonClick = () => {
    setMarcasDropdownAbierto(!marcasDropdownAbierto)
  }

  return (
    <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">

      {/* =====================================================
          BOTONES DE ACCESO RÁPIDO
          ===================================================== */}

      <div className="relative border-b border-[#E2E8F0]">

        {/* Contenedor deslizable en móvil / Centrado en PC */}
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
                    ${activo
                      ? 'bg-[#12283F]/[0.06] ring-1 ring-[#12283F]/30'
                      : 'hover:bg-[#F5F7FA]'
                    }
                  `}
                  aria-label={`Ver categoría ${boton}`}
                >

                  <span
                    className="
                      h-16 w-16
                      sm:h-20 sm:w-20
                      overflow-hidden
                      rounded-full
                      border border-[#E2E8F0]
                      bg-white
                      shadow-sm
                    "
                  >
                    <img
                      src={icono}
                      alt={boton}
                      className="h-full w-full object-cover"
                    />
                  </span>

                  <span
                    className={`
                      whitespace-nowrap
                      text-[9px] sm:text-[10px]
                      font-bold
                      tracking-wide
                      ${activo
                        ? 'text-[#12283F]'
                        : 'text-[#64748B]'
                      }
                    `}
                  >
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
                  shrink-0
                  whitespace-nowrap
                  px-3 py-1
                  text-[10px]
                  font-bold
                  tracking-wide
                  rounded-full
                  transition-all
                  ${
                    categoriaActiva === boton
                      ? 'bg-[#12283F] text-white'
                      : 'text-[#64748B] hover:bg-[#F5F7FA]'
                  }
                `}
              >
                {boton}
              </button>
            )
          })}

        </div>

        {/* Indicadores laterales en móvil (no se ven en PC) */}
        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            bottom-0
            w-10
            bg-gradient-to-l
            from-white
            to-transparent
            sm:hidden
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            bottom-0
            w-3
            bg-gradient-to-r
            from-white
            to-transparent
            sm:hidden
          "
        />

      </div>


      {/* =====================================================
          SECCIONES PRINCIPALES
          ===================================================== */}

      {/* 
          CAMBIO DEFINITIVO EN CSS:
          Eliminamos el overflow-x-auto del contenedor de los botones.
          En su lugar, envolvemos los botones en un div con w-max y overflow-x-auto.
          Esto permite que los Dropdowns se salgan completamente del flujo sin ser cortados.
      */}
      <div className="max-w-7xl mx-auto px-4 py-2">

        <div className="flex flex-nowrap items-center justify-between">
          
          {/* Envolvemos solo las categorías con el scroll, para que el celular pueda deslizar */}
          <div 
            className="flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-visible scrollbar-hide pb-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >

            {/* TODOS */}
            <button
              onClick={() => handleSeccionClick(null)}
              className={`
                shrink-0
                px-3 py-1
                text-xs
                font-semibold
                rounded-lg
                transition-all
                ${
                  seccionActiva === null
                    ? 'bg-[#12283F] text-white'
                    : 'text-[#64748B] hover:bg-[#F5F7FA]'
                }
              `}
            >
              Todos
            </button>


            {/* SECCIONES */}
            {SECCIONES.map((seccion) => (

              <div
                key={seccion.id}
                className="relative group shrink-0"
              >

                <button
                  onClick={() => handleSeccionClick(seccion.id)}
                  className={`
                    shrink-0
                    whitespace-nowrap
                    px-3 py-1
                    text-xs
                    font-semibold
                    rounded-lg
                    transition-all
                    ${
                      seccionActiva === seccion.id
                        ? 'bg-[#12283F] text-white'
                        : 'text-[#64748B] hover:bg-[#F5F7FA]'
                    }
                  `}
                >
                  {seccion.nombre}
                </button>

                {/* DROPDOWN (Totalmente libre, ya no se corta) */}
                <div className="absolute left-0 top-full hidden pt-1 group-hover:block z-40">

                  <div className="min-w-[220px] rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-lg">

                    {seccion.categorias.map((cat) => (

                      <button
                        key={cat}
                        onClick={() => handleCategoriaClick(cat)}
                        className={`
                          block
                          w-full
                          rounded
                          px-3 py-1.5
                          text-left
                          text-xs
                          transition-colors
                          ${
                            categoriaActiva === cat
                              ? 'bg-[#F5F7FA] font-semibold text-[#12283F]'
                              : 'text-[#64748B] hover:bg-[#F5F7FA]'
                          }
                        `}
                      >
                        {cat}
                      </button>

                    ))}

                    <button
                      onClick={() => handleSeccionClick(seccion.id)}
                      className="
                        mt-1
                        block
                        w-full
                        rounded
                        border-t
                        border-[#E2E8F0]
                        px-3
                        py-1.5
                        text-left
                        text-xs
                        font-semibold
                        text-[#12283F]
                        transition-colors
                        hover:bg-[#F5F7FA]
                      "
                    >
                      Ver toda la sección
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* =====================================================
              MARCAS (Ahora está fuera del div que hace scroll)
              ===================================================== */}
          {marcasFiltradas.length > 0 && (

            <div 
              className="relative group ml-2 shrink-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >

              <button
                onClick={handleButtonClick}
                className="
                  whitespace-nowrap
                  px-3 py-1
                  text-xs
                  font-medium
                  text-[#64748B]
                  hover:bg-[#F5F7FA]
                  rounded-full
                  transition-colors
                  flex items-center gap-1
                "
              >
                Marcas <span className="text-[10px]">▼</span>
              </button>

              <div className={`absolute right-0 top-full pt-1 z-50 ${marcasDropdownAbierto ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] p-1 min-w-[140px]">
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca}
                      onClick={() => handleCategoriaClick(marca)}
                      className="
                        block
                        w-full
                        text-left
                        px-3 py-1.5
                        text-xs
                        text-[#64748B]
                        hover:bg-[#F5F7FA]
                        rounded
                        transition-colors
                      "
                    >
                      {marca}
                    </button>
                  ))}
                  <button
                    onClick={() => handleCategoriaClick('Todas')}
                    className="
                      block
                      w-full
                      text-left
                      px-3 py-1.5
                      text-xs
                      font-semibold
                      text-[#12283F]
                      hover:bg-[#F5F7FA]
                      rounded
                      transition-colors
                      border-t
                      border-[#E2E8F0]
                      mt-1
                      pt-1.5
                    "
                  >
                    Ver Todos
                  </button>
                </div>
              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}