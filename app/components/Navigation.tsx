'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

// Botones de acceso rápido (como en la web de BarberWorld)
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

// Íconos opcionales para botones rápidos puntuales.
// Las imágenes deben vivir en /public (ej: /public/oldschool.png) para poder
// referenciarlas como '/oldschool.png'. Los nombres de archivo deben coincidir
// EXACTO (mayúsculas/minúsculas incluidas) con lo que subas a /public,
// porque en producción (Vercel/Linux) el sistema de archivos es sensible a mayúsculas.
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

// Grupos de categorías (sin emojis, con tipografía elegante)
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
        const marcasUnicas = [...new Set(data.map(p => p.marca))].filter(Boolean)
        setMarcas(marcasUnicas.sort())
      }
    }
    cargarMarcas()
  }, [])

  const marcasDestacadas = ['Babyliss', 'JRL', 'Reuzel', 'Stylecraft', 'Street', 'Turbox', 'Old School', 'Wahl', 'Very Secret']
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

  // Click en una subcategoría dentro del dropdown de una sección:
  // filtra directo por esa categoría puntual (page.tsx ya sabe resolver
  // un nombre de categoría exacto que no es marca ni botón rápido).
  const handleCategoriaClick = (categoria: string) => {
    onCategoriaChange?.(categoria)
  }

  return (
    <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
      {/* Botones de acceso rápido */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0]">
        {BOTONES_RAPIDOS.map((boton) => {
          const icono = ICONOS_BOTONES[boton]

          if (icono) {
            const activo = categoriaActiva === boton
            return (
              <button
                key={boton}
                onClick={() => onCategoriaChange?.(boton)}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all ${
                  activo ? 'bg-[#12283F]/[0.06] ring-1 ring-[#12283F]/30' : 'hover:bg-[#F5F7FA]'
                }`}
                aria-label={`Ver categoría ${boton}`}
              >
                <span className="h-20 w-20 overflow-hidden rounded-full border border-[#E2E8F0] bg-white shadow-sm">
                  <img
                    src={icono}
                    alt={boton}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wide ${
                    activo ? 'text-[#12283F]' : 'text-[#64748B]'
                  }`}
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
              className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-full transition-all ${
                categoriaActiva === boton
                  ? 'bg-[#12283F] text-white'
                  : 'text-[#64748B] hover:bg-[#F5F7FA]'
              }`}
            >
              {boton}
            </button>
          )
        })}
      </div>

      {/* Secciones (navegación principal) */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => handleSeccionClick(null)}
            className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              seccionActiva === null
                ? 'bg-[#12283F] text-white'
                : 'text-[#64748B] hover:bg-[#F5F7FA]'
            }`}
          >
            Todos
          </button>

          {SECCIONES.map((seccion) => (
            <div key={seccion.id} className="relative group shrink-0">
              <button
                onClick={() => handleSeccionClick(seccion.id)}
                className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  seccionActiva === seccion.id
                    ? 'bg-[#12283F] text-white'
                    : 'text-[#64748B] hover:bg-[#F5F7FA]'
                }`}
              >
                {seccion.nombre}
              </button>

              {/* Dropdown de subcategorías al pasar el cursor */}
              <div className="absolute left-0 top-full hidden pt-1 group-hover:block z-40">
                <div className="min-w-[220px] rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-lg">
                  {seccion.categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoriaClick(cat)}
                      className={`block w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${
                        categoriaActiva === cat
                          ? 'bg-[#F5F7FA] font-semibold text-[#12283F]'
                          : 'text-[#64748B] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  <button
                    onClick={() => handleSeccionClick(seccion.id)}
                    className="mt-1 block w-full rounded border-t border-[#E2E8F0] px-3 py-1.5 pt-1.5 text-left text-xs font-semibold text-[#12283F] transition-colors hover:bg-[#F5F7FA]"
                  >
                    Ver toda la sección
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Marcas */}
          {marcasFiltradas.length > 0 && (
            <div className="relative group ml-auto">
              <button className="px-3 py-1 text-xs font-medium text-[#64748B] hover:bg-[#F5F7FA] rounded-full transition-colors">
                Marcas ▼
              </button>
              <div className="absolute right-0 pt-1 hidden group-hover:block z-40">
                <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] p-1 min-w-[140px]">
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca}
                      onClick={() => onCategoriaChange?.(marca)}
                      className="block w-full text-left px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F5F7FA] rounded transition-colors"
                    >
                      {marca}
                    </button>
                  ))}
                  <button
                    onClick={() => onCategoriaChange?.('Todas')}
                    className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-[#12283F] hover:bg-[#F5F7FA] rounded transition-colors border-t border-[#E2E8F0] mt-1 pt-1.5"
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
