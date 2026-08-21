'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from './lib/supabase'
import { useCart } from './components/CartContext'
import Navigation from './components/Navigation'
import PoliticasModal, { type ClavePolitica } from './components/PoliticasModal'

const REDES_SOCIALES = {
  facebook: 'https://www.facebook.com/barberworldcolombia/',
  instagram: 'https://www.instagram.com/barberworldcolombia/',
  tiktok: 'https://www.tiktok.com/@barberworldcolombia',
}

type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string | null
  imagen_url: string | null
  activo: boolean
  marca: string | null
  created_at: string
}

const SECCIONES = [
  { id: 'electricos', nombre: 'Eléctricos', categorias: ['Peluqueras', 'Patilleras', 'Afeitadoras', 'Trimmers de Nariz', 'Secadores', 'Secadores y cepillo secador', 'Rizadoras, pinzas y conos', 'Planchas', 'Masajeadores y spa de pies'] },
  { id: 'manuales', nombre: 'Manuales', categorias: ['Tijeras', 'Barberas y Minoras', 'Cabezotes', 'Guias de Corte'] },
  { id: 'cuidado', nombre: 'Cuidado y Estilizado', categorias: ['Ceras', 'Geles, balsamos y cremas de peinar', 'Lacas', 'Shampoos y Acondicionadores', 'Keratinas, serums y tratamientos capilares', 'Voluminizantes', 'Pigmentos, fibras, tintes y aerografos', 'Productos de estilizado'] },
  { id: 'aseo', nombre: 'Aseo y Protección', categorias: ['After Shave', 'Shaving Gel', 'Talcos', 'Cremas, exfoliantes y vaselinas', 'Mascarillas, velos y tratamientos faciales', 'Barba', 'Tatuajes', 'Guantes, tapabocas y proteccion'] },
  { id: 'accesorios', nombre: 'Accesorios y Puesto', categorias: ['Capas', 'Cuelleros, toallas y paños', 'Atomizadores, pulverizadores y sprays', 'Brochas, talqueras y sacudidores', 'Peinillas', 'Cepillos', 'Tapetes, bases y puesto de trabajo', 'Caimanes, pinzas y sujetadores', 'Maletas, gorras y accesorios', 'Mandiles'] },
  { id: 'repuestos', nombre: 'Repuestos y Mantenimiento', categorias: ['Repuestos', 'Lubricantes, Aceites y Mantenimiento'] },
  { id: 'combos', nombre: 'Combos y Kits', categorias: ['Combos'] },
  { id: 'otros', nombre: 'Otros', categorias: ['Otros', 'Remates', 'Minoxidil', 'Ollas de cera y depilacion', 'Pulidores, drill y uñas', 'Cortadoras', 'Mascotas', 'Productos para barbería'] }
]

const PRODUCTOS_POR_SECCION = 8

function IconoFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
    </svg>
  )
}

function IconoInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconoTiktok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16.5 2h-3.2v13.6a2.7 2.7 0 11-2.7-2.7c.2 0 .5 0 .7.08V9.7a5.9 5.9 0 00-.7 0A5.9 5.9 0 1016.5 15.6V8.4a7.9 7.9 0 004.5 1.4V6.6a4.7 4.7 0 01-4.5-4.6z" />
    </svg>
  )
}

function IconoBusquedaVacia() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-[#CBD5E1]">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3M9 11h4" />
    </svg>
  )
}

function esProductoNuevo(fecha: string): boolean {
  const creado = new Date(fecha).getTime()
  const ahora = Date.now()
  const dias = (ahora - creado) / (1000 * 60 * 60 * 24)
  return dias <= 7
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E7ECF2] overflow-hidden">
      <div className="aspect-square bg-[#EEF2F6] animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-16 bg-[#EEF2F6] rounded-full animate-pulse" />
        <div className="h-3.5 w-full bg-[#EEF2F6] rounded-full animate-pulse" />
        <div className="h-3.5 w-2/3 bg-[#EEF2F6] rounded-full animate-pulse" />
        <div className="h-4 w-20 bg-[#EEF2F6] rounded-full animate-pulse !mt-3" />
        <div className="h-10 w-full bg-[#EEF2F6] rounded-lg animate-pulse !mt-3" />
      </div>
    </div>
  )
}

function ProductCard({
  producto,
  cantidad,
  animando,
  onSeleccionar,
  onAgregar,
  onAumentar,
  onDisminuir,
}: {
  producto: Producto
  cantidad: number | undefined
  animando: boolean
  onSeleccionar: () => void
  onAgregar: () => void
  onAumentar: () => void
  onDisminuir: () => void
}) {
  const nuevo = esProductoNuevo(producto.created_at)

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#E7ECF2] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#12283F]/15 hover:shadow-[0_16px_32px_-16px_rgba(18,40,63,0.35)] ${
        animando ? 'ring-2 ring-[#12283F] ring-offset-2' : ''
      }`}
    >
      <button
        type="button"
        onClick={onSeleccionar}
        className="flex-1 cursor-pointer text-left"
        aria-label={`Ver detalles de ${producto.nombre}`}
      >
        <div className="relative aspect-square overflow-hidden bg-white">
          {nuevo && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#12283F] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
              Nuevo
            </span>
          )}

          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-medium uppercase tracking-wide text-[#A8B3C1]">
              Sin imagen
            </div>
          )}
        </div>

        <div className="p-4">
          {producto.categoria && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.09em] text-[#8C98A8]">
              {producto.categoria}
            </p>
          )}

          <h3 className="text-[13.5px] font-semibold leading-snug text-[#12283F]">
            {producto.nombre}
          </h3>

          {producto.marca && (
            <p className="mt-0.5 text-[11px] text-[#9AA5B3]">
              {producto.marca}
            </p>
          )}

          {producto.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
              {producto.descripcion}
            </p>
          )}

          <p className="mt-2.5 text-[15px] font-bold tracking-tight text-[#12283F]">
            ${producto.precio.toLocaleString('es-CO')}
          </p>
        </div>
      </button>

      <div className="mt-auto px-4 pb-4">
        {!cantidad ? (
          <button
            type="button"
            onClick={onAgregar}
            className={`w-full rounded-lg bg-[#12283F] py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-[#1C3D5F] active:scale-[0.98] ${
              animando ? 'scale-95' : 'scale-100'
            }`}
          >
            {animando ? '✓ Agregado' : '+ Agregar al pedido'}
          </button>
        ) : (
          <div className="flex items-center justify-between overflow-hidden rounded-lg border border-[#E7ECF2]">
            <button
              type="button"
              onClick={onDisminuir}
              className="flex h-9 w-10 items-center justify-center font-bold text-[#12283F] transition-colors hover:bg-[#F5F7FA]"
              aria-label={`Disminuir cantidad de ${producto.nombre}`}
            >
              −
            </button>

            <span className="text-sm font-bold text-[#12283F]">
              {cantidad}
            </span>

            <button
              type="button"
              onClick={onAumentar}
              className="flex h-9 w-10 items-center justify-center font-bold text-[#12283F] transition-colors hover:bg-[#F5F7FA]"
              aria-label={`Aumentar cantidad de ${producto.nombre}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const supabase = createClient()

  const { items, agregarProducto, aumentarCantidad, disminuirCantidad } = useCart()

  const [productos, setProductos] = useState<Producto[]>([])
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [email, setEmail] = useState('')
  const [recienAgregado, setRecienAgregado] = useState<string | null>(null)

  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [politicaAbierta, setPoliticaAbierta] = useState<ClavePolitica>(null)

  const seccionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function cargarProductos() {
      const TAMANO = 1000
      let desde = 0
      const todos: Producto[] = []

      for (;;) {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('imagen_url', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .range(desde, desde + TAMANO - 1)

        if (error || !data || data.length === 0) break

        todos.push(...(data as Producto[]))

        if (data.length < TAMANO) break
        desde += TAMANO
      }

      setProductos(todos)
      setProductosFiltrados(todos)
      setCargando(false)
    }

    cargarProductos()
  }, [])

  useEffect(() => {
    const normalizar = (t: string) =>
      (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    let filtrados = productos

    if (busqueda.trim()) {
      const q = normalizar(busqueda)
      const terminos = q.split(/\s+/).filter(Boolean)
      filtrados = filtrados.filter(p => {
        const texto = normalizar(`${p.nombre} ${p.categoria || ''} ${p.marca || ''}`)
        return terminos.every(t => texto.includes(t))
      })
    }

    if (categoriaActiva !== 'Todas') {
      const botonAMarca: Record<string, string> = {
        'OLD SCHOOL': 'Old School',
        'STREET': 'Street',
      }

      if (botonAMarca[categoriaActiva]) {
        const marcaBuscada = normalizar(botonAMarca[categoriaActiva])
        filtrados = filtrados.filter(p => normalizar(p.marca || '') === marcaBuscada)
      } else if (productos.some(p => p.marca === categoriaActiva)) {
        filtrados = filtrados.filter(p => p.marca === categoriaActiva)
      } else {
        const botonACategorias: Record<string, string[]> = {
          'PELUQUERAS': ['Peluqueras'],
          'AFEITADORAS': ['Afeitadoras'],
          'CERAS': ['Ceras'],
          'PLANCHAS': ['Planchas'],
          'SECADORES': ['Secadores y cepillo secador'],
          'TODA LA TIENDA': [],
        }

        if (categoriaActiva in botonACategorias) {
          const cats = botonACategorias[categoriaActiva]
          if (cats.length > 0) {
            filtrados = filtrados.filter(p => cats.includes(p.categoria || ''))
          }
        } else {
          const grupos: Record<string, string[]> = {
            'Eléctricos': ['Peluqueras', 'Patilleras', 'Afeitadoras', 'Trimmers de Nariz', 'Secadores', 'Secadores y cepillo secador', 'Rizadoras, pinzas y conos', 'Planchas', 'Masajeadores y spa de pies'],
            'Manuales': ['Tijeras', 'Barberas y Minoras', 'Cabezotes', 'Guias de Corte'],
            'Cuidado y Estilizado': ['Ceras', 'Geles, balsamos y cremas de peinar', 'Lacas', 'Shampoos y Acondicionadores', 'Keratinas, serums y tratamientos capilares', 'Voluminizantes', 'Pigmentos, fibras, tintes y aerografos', 'Productos de estilizado'],
            'Aseo y Protección': ['After Shave', 'Shaving Gel', 'Talcos', 'Cremas, exfoliantes y vaselinas', 'Mascarillas, velos y tratamientos faciales', 'Barba', 'Tatuajes', 'Guantes, tapabocas y proteccion'],
            'Accesorios y Puesto': ['Capas', 'Cuelleros, toallas y paños', 'Atomizadores, pulverizadores y sprays', 'Brochas, talqueras y sacudidores', 'Peinillas', 'Cepillos', 'Tapetes, bases y puesto de trabajo', 'Caimanes, pinzas y sujetadores', 'Maletas, gorras y accesorios', 'Mandiles'],
            'Repuestos y Mantenimiento': ['Repuestos', 'Lubricantes, Aceites y Mantenimiento'],
            'Combos y Kits': ['Combos'],
            'Otros': ['Otros', 'Remates', 'Minoxidil', 'Ollas de cera y depilacion', 'Pulidores, drill y uñas', 'Cortadoras', 'Mascotas', 'Productos para barbería'],
          }

          const categoriasDelGrupo = grupos[categoriaActiva] || [categoriaActiva]
          filtrados = filtrados.filter(p => categoriasDelGrupo.includes(p.categoria || ''))
        }
      }
    }

    setProductosFiltrados(filtrados)
  }, [busqueda, categoriaActiva, productos])

  const productosAgrupados = SECCIONES.map(seccion => ({
    ...seccion,
    productos: productosFiltrados.filter(p => seccion.categorias.includes(p.categoria || ''))
  })).filter(g => g.productos.length > 0)

  const seccionActivaNombre = seccionActiva
    ? SECCIONES.find(s => s.id === seccionActiva)?.nombre || seccionActiva
    : null

  const seccionActivaObj = seccionActiva
    ? SECCIONES.find(s => s.id === seccionActiva)
    : null

  const productosDeSeccionActiva = seccionActivaObj
    ? productosFiltrados.filter(p => seccionActivaObj.categorias.includes(p.categoria || ''))
    : []

  const mensajesTicker = [
    'Catálogo exclusivo para mayoristas autorizados de Barberworld',
    'Envíos a todo el país',
  ]

  const redesSociales = [
    { nombre: 'Facebook', url: REDES_SOCIALES.facebook, icono: <IconoFacebook /> },
    { nombre: 'Instagram', url: REDES_SOCIALES.instagram, icono: <IconoInstagram /> },
    { nombre: 'TikTok', url: REDES_SOCIALES.tiktok, icono: <IconoTiktok /> },
  ]

  function cerrarDetalle() {
    setProductoSeleccionado(null)
  }

  function dispararAnimacionAgregado(id: string) {
    setRecienAgregado(id)
    setTimeout(() => { setRecienAgregado(null) }, 500)
  }

  function manejarAgregar(producto: Producto) {
    const productoEnCarrito = items.find((item) => item.id === producto.id)
    if (!productoEnCarrito) {
      agregarProducto({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
      })
      dispararAnimacionAgregado(producto.id)
    }
  }

  function manejarAgregarDesdeDetalle() {
    if (!productoSeleccionado) return
    manejarAgregar(productoSeleccionado)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setCategoriaActiva('Todas')
    setSeccionActiva(null)
  }

  function abrirPolitica(tipo: ClavePolitica) {
    setPoliticaAbierta(tipo)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2A37] antialiased">
      <div className="overflow-hidden whitespace-nowrap bg-[#12283F] py-2 text-[11px] font-medium tracking-wide text-white/90">
        <div className="flex w-max animate-marquee">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center">
              {mensajesTicker[i % mensajesTicker.length]}
              <span className="mx-8 text-white/40">•</span>
            </span>
          ))}
        </div>
      </div>

      <header className="relative z-40 border-b border-[#E7ECF2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Barberworld"
              className="h-12 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <h1 className="text-[#12283F] text-4xl leading-none tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                BARBERWORLD
              </h1>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C98A8]">
                Catálogo de mayoristas
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-96">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#EAF2FF]">
              <svg className="h-3.5 w-3.5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-full border border-[#E7ECF2] bg-white py-3 pl-12 pr-4 text-sm text-[#1F2A37] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all placeholder:text-[#9AA5B3] focus:border-[#2563EB]/40 focus:shadow-[0_4px_14px_rgba(37,99,235,0.12)] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>
        </div>

        <Navigation
          onCategoriaChange={setCategoriaActiva}
          categoriaActiva={categoriaActiva}
          onSeccionChange={setSeccionActiva}
          seccionActiva={seccionActiva}
        />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {cargando ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        ) : (seccionActiva ? productosDeSeccionActiva.length === 0 : productosFiltrados.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconoBusquedaVacia />
            <p className="mt-4 text-sm font-semibold text-[#334155]">
              {productos.length === 0 ? 'Aún no hay productos cargados.' : 'No encontramos productos con ese filtro'}
            </p>
            {productos.length > 0 && (
              <>
                <p className="mt-1 text-xs text-[#94A3B8]">Prueba con otra palabra o revisa otra categoría.</p>
                <button type="button" onClick={limpiarFiltros} className="mt-4 rounded-full border border-[#CBD5E1] px-4 py-1.5 text-xs font-semibold text-[#12283F] transition-colors hover:bg-white">
                  Quitar filtros
                </button>
              </>
            )}
          </div>
        ) : seccionActiva ? (
          <div>
            <h2 className="mb-4 text-2xl text-[#12283F]" style={{ fontFamily: 'var(--font-display)' }}>
              {seccionActivaNombre}
              <span className="ml-2 text-sm font-normal tracking-normal text-[#64748B]" style={{ fontFamily: 'inherit' }}>
                ({productosDeSeccionActiva.length} {productosDeSeccionActiva.length === 1 ? 'producto' : 'productos'})
              </span>
            </h2>
            <div className="grid grid-cols-2 items-stretch gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {productosDeSeccionActiva.map((producto) => {
                const itemCarrito = items.find((item) => item.id === producto.id)
                return (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    cantidad={itemCarrito?.cantidad}
                    animando={recienAgregado === producto.id}
                    onSeleccionar={() => setProductoSeleccionado(producto)}
                    onAgregar={() => manejarAgregar(producto)}
                    onAumentar={() => aumentarCantidad(producto.id)}
                    onDisminuir={() => disminuirCantidad(producto.id)}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            {productosAgrupados.map((grupo) => {
              const productosMostrar = grupo.productos.slice(0, PRODUCTOS_POR_SECCION)
              const tieneMas = grupo.productos.length > PRODUCTOS_POR_SECCION
              return (
                <div key={grupo.id} ref={(el) => { seccionRefs.current[grupo.id] = el }}>
                  <div className="mb-4 flex items-center justify-between border-b border-[#E7ECF2] pb-3">
                    <h2 className="text-2xl text-[#12283F]" style={{ fontFamily: 'var(--font-display)' }}>
                      {grupo.nombre}
                      <span className="ml-2 text-sm font-normal tracking-normal text-[#64748B]" style={{ fontFamily: 'inherit' }}>
                        ({grupo.productos.length} {grupo.productos.length === 1 ? 'producto' : 'productos'})
                      </span>
                    </h2>
                    {tieneMas && (
                      <button onClick={() => setSeccionActiva(grupo.id)} className="text-sm font-semibold text-[#1C3D5F] hover:underline">
                        Ver todos →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 items-stretch gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {productosMostrar.map((producto) => {
                      const itemCarrito = items.find((item) => item.id === producto.id)
                      return (
                        <ProductCard
                          key={producto.id}
                          producto={producto}
                          cantidad={itemCarrito?.cantidad}
                          animando={recienAgregado === producto.id}
                          onSeleccionar={() => setProductoSeleccionado(producto)}
                          onAgregar={() => manejarAgregar(producto)}
                          onAumentar={() => aumentarCantidad(producto.id)}
                          onDisminuir={() => disminuirCantidad(producto.id)}
                        />
                      )
                    })}
                  </div>

                  {tieneMas && (
                    <div className="mt-5 text-center">
                      <button onClick={() => setSeccionActiva(grupo.id)} className="rounded-full border border-[#E7ECF2] px-6 py-2 text-sm font-medium text-[#1C3D5F] transition-colors hover:bg-white hover:border-[#12283F]/20">
                        Ver todos los {grupo.productos.length} productos →
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1622]/70 p-4 backdrop-blur-sm" onClick={cerrarDetalle}>
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={cerrarDetalle} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#12283F] shadow-md transition-colors hover:bg-[#F5F7FA]" aria-label="Cerrar detalle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative flex min-h-[320px] items-center justify-center bg-[#F5F7FA] md:min-h-[520px]">
                {esProductoNuevo(productoSeleccionado.created_at) && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#12283F] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    Nuevo
                  </span>
                )}
                {productoSeleccionado.imagen_url ? (
                  <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} className="max-h-[520px] w-full object-contain" />
                ) : (
                  <div className="text-sm uppercase tracking-wide text-[#94A3B8]">Sin imagen</div>
                )}
              </div>

              <div className="flex flex-col p-7 md:p-10">
                {productoSeleccionado.categoria && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8C98A8]">
                    {productoSeleccionado.categoria}
                  </p>
                )}
                <h2 className="text-3xl leading-tight text-[#12283F] md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
                  {productoSeleccionado.nombre}
                </h2>
                {productoSeleccionado.marca && (
                  <p className="mt-1.5 text-sm text-[#8C98A8]">
                    Marca: <span className="font-medium text-[#64748B]">{productoSeleccionado.marca}</span>
                  </p>
                )}
                <div className="mb-6 mt-5 h-1 w-12 rounded-full bg-[#12283F]" />
                <p className="text-2xl font-bold tracking-tight text-[#12283F]">
                  ${productoSeleccionado.precio.toLocaleString('es-CO')}
                </p>
                <div className="mt-7">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#12283F]">Descripción</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    {productoSeleccionado.descripcion || 'No hay una descripción disponible para este producto.'}
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  {!items.find((item) => item.id === productoSeleccionado.id) ? (
                    <button type="button" onClick={manejarAgregarDesdeDetalle} className="w-full rounded-lg bg-[#12283F] py-3.5 font-semibold text-white transition-colors hover:bg-[#1C3D5F]">
                      {recienAgregado === productoSeleccionado.id ? '✓ Agregado al pedido' : '+ Agregar al pedido'}
                    </button>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-[#E7ECF2]">
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => disminuirCantidad(productoSeleccionado.id)} className="flex h-12 w-14 items-center justify-center text-xl font-bold text-[#12283F] hover:bg-[#F5F7FA]">
                          −
                        </button>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Cantidad</p>
                          <span className="text-lg font-semibold text-[#12283F]">
                            {items.find((item) => item.id === productoSeleccionado.id)?.cantidad}
                          </span>
                        </div>
                        <button type="button" onClick={() => aumentarCantidad(productoSeleccionado.id)} className="flex h-12 w-14 items-center justify-center text-xl font-bold text-[#12283F] hover:bg-[#F5F7FA]">
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button type="button" onClick={cerrarDetalle} className="mt-3 w-full py-3 text-sm text-[#64748B] transition-colors hover:text-[#12283F]">
                  ← Volver al catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="-mb-1 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="h-[60px] w-full sm:h-[90px]">
          <path fill="#12283F" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z" />
        </svg>
      </div>

      <footer className="bg-[#12283F] pb-8 pt-4 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src="/logo.png" alt="Barberworld" className="mb-4 h-14 w-auto object-contain brightness-0 invert" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <p className="text-sm leading-relaxed text-white/70">
              Somos una tienda de productos de <span className="font-medium text-white">Barbería</span>, <span className="font-medium text-white">peluquería</span> y <span className="font-medium text-white">cuidado personal</span> con más de <span className="font-medium text-white">20 años de experiencia</span> en el mercado.
            </p>
            <div className="mt-4 flex gap-2">
              {redesSociales.map((red) => (
                <a key={red.nombre} href={red.url} target="_blank" rel="noopener noreferrer" aria-label={red.nombre} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white hover:text-[#12283F]">
                  {red.icono}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Información de contacto</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Teléfono <a href="tel:3223320949" className="underline hover:text-white">3223320949</a></li>
              <li>Email <a href="mailto:barberworldstore@gmail.com" className="underline hover:text-white">barberworldstore@gmail.com</a></li>
              <li>Dirección <span className="underline">Calle 8 #20-30</span></li>
              <li>C.C Siete Mares Oficina 206-207</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Políticas</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="cursor-pointer hover:text-white" onClick={() => abrirPolitica('contacto')}>Información de contacto</li>
              <li className="cursor-pointer hover:text-white" onClick={() => abrirPolitica('privacidad')}>Políticas de privacidad</li>
              <li className="cursor-pointer hover:text-white" onClick={() => abrirPolitica('reembolso')}>Políticas de reembolso</li>
              <li className="cursor-pointer hover:text-white" onClick={() => abrirPolitica('envio')}>Políticas de envío</li>
              <li className="cursor-pointer hover:text-white" onClick={() => abrirPolitica('terminos')}>Términos de servicio</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Mantente actualizado</h4>
            <p className="mb-3 text-sm text-white/70">¡Regístrate y mantente actualizado de nuevos lanzamientos, promociones y eventos!</p>
            <form onSubmit={(e) => { e.preventDefault(); setEmail('') }} className="flex items-center rounded-full bg-white/10 py-1 pl-4 pr-1">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder-white/50" />
              <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#12283F]" aria-label="Suscribirme">→</button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-white/50">Formas de pago</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-[#1F72CD] px-3 py-1.5 text-[11px] font-semibold text-white">AMEX</span>
            <span className="rounded bg-white px-3 py-1.5 text-[11px] font-semibold text-[#12283F]">DINERS</span>
            <span className="rounded bg-[#1A1F71] px-3 py-1.5 text-[11px] font-semibold text-white">MASTERCARD</span>
            <span className="rounded bg-[#1A1F71] px-3 py-1.5 text-[11px] font-semibold text-white">VISA</span>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-6xl border-t border-white/10 px-4 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Barberworld · Catálogo de mayoristas
        </div>
      </footer>

      <PoliticasModal politica={politicaAbierta} onCerrar={() => setPoliticaAbierta(null)} />
    </div>
  )
}
