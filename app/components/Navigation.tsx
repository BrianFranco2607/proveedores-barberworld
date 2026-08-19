'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

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
  }

  return (
    <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">

      {/* =====================================================
          SECCIONES PRINCIPALES
          ===================================================== */}

      <div className="max-w-7xl mx-auto px-4 py-2">

        <div
          className="
            flex
            flex-nowrap
            items-center
            gap-1
            overflow-x-auto
            overflow-y-visible
            scrollbar-hide
          "
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


              {/* DROPDOWN */}

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


          {/* =====================================================
              MARCAS
              ===================================================== */}

          {marcasFiltradas.length > 0 && (

            <div className="relative group ml-auto shrink-0">

              <button
                className="
                  whitespace-nowrap
                  px-3 py-1
                  text-xs
                  font-medium
                  text-[#64748B]
                  hover:bg-[#F5F7FA]
                  rounded-full
                  transition-colors
                "
              >
                Marcas ▼
              </button>


              <div className="absolute right-0 pt-1 hidden group-hover:block z-40">

                <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] p-1 min-w-[140px]">

                  {marcasFiltradas.map((marca) => (

                    <button
                      key={marca}
                      onClick={() => onCategoriaChange?.(marca)}
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
                    onClick={() => onCategoriaChange?.('Todas')}
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