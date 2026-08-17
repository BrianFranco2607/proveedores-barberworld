'use client'

import { useEffect, useState } from 'react'
import { createClient } from './lib/supabase'
import { useCart } from './components/CartContext'
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
  created_at: string
}

function IconoFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
    </svg>
  )
}

function IconoInstagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-4 h-4"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-12 h-12 text-[#CBD5E1]"
    >
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
    <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#E2E8F0]" />

      <div className="p-4">
        <div className="h-2.5 w-16 bg-[#E2E8F0] rounded mb-2" />
        <div className="h-3.5 w-full bg-[#E2E8F0] rounded mb-2" />
        <div className="h-3.5 w-2/3 bg-[#E2E8F0] rounded mb-3" />
        <div className="h-4 w-20 bg-[#E2E8F0] rounded mb-3" />
        <div className="h-9 w-full bg-[#E2E8F0] rounded-md" />
      </div>
    </div>
  )
}

export default function Home() {
  const supabase = createClient()

  const {
    items,
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
  } = useCart()

  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [cargando, setCargando] = useState(true)
  const [email, setEmail] = useState('')
  const [recienAgregado, setRecienAgregado] = useState<string | null>(null)

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null)

  const [politicaAbierta, setPoliticaAbierta] =
    useState<ClavePolitica>(null)

  useEffect(() => {
    async function cargarProductos() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })

      if (!error) {
        setProductos(data || [])
      }

      setCargando(false)
    }

    cargarProductos()
  }, [])

  const categorias = [
    'Todas',
    ...Array.from(
      new Set(
        productos
          .map((p) => p.categoria)
          .filter((c): c is string => !!c && c.trim() !== '')
      )
    ).sort(),
  ]

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())

    const coincideCategoria =
      categoriaActiva === 'Todas' || p.categoria === categoriaActiva

    return coincideBusqueda && coincideCategoria
  })

  const mensajesTicker = [
    'Catálogo exclusivo para proveedores autorizados de Barberworld',
    'Envíos a todo el país',
  ]

  const redesSociales = [
    {
      nombre: 'Facebook',
      url: REDES_SOCIALES.facebook,
      icono: <IconoFacebook />,
    },
    {
      nombre: 'Instagram',
      url: REDES_SOCIALES.instagram,
      icono: <IconoInstagram />,
    },
    {
      nombre: 'TikTok',
      url: REDES_SOCIALES.tiktok,
      icono: <IconoTiktok />,
    },
  ]

  function cerrarDetalle() {
    setProductoSeleccionado(null)
  }

  function dispararAnimacionAgregado(id: string) {
    setRecienAgregado(id)
    setTimeout(() => setRecienAgregado(null), 500)
  }

  function manejarAgregar(producto: Producto) {
    const productoEnCarrito = items.find(
      (item) => item.id === producto.id
    )

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
  }

  function abrirPolitica(tipo: ClavePolitica) {
    setPoliticaAbierta(tipo)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Ticker superior */}
      <div className="bg-[#12283F] text-white text-xs tracking-wide overflow-hidden whitespace-nowrap py-2">
        <div className="flex animate-marquee w-max">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="flex items-center mx-8 opacity-90"
            >
              {mensajesTicker[i % mensajesTicker.length]}
              <span className="mx-8 opacity-50">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Barberworld"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />

            <div>
              <h1
                className="text-[#12283F] text-4xl leading-none tracking-wide"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                BARBERWORLD
              </h1>

              <p className="text-[#64748B] text-xs mt-1 tracking-wide uppercase">
                Catálogo de proveedores
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F] focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {categorias.length > 1 && (
          <div className="max-w-6xl mx-auto px-4 pb-4 flex gap-2 overflow-x-auto">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaActiva(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border transition-colors ${
                  categoriaActiva === cat
                    ? 'bg-[#12283F] text-white border-[#12283F]'
                    : 'bg-white text-[#12283F] border-[#E2E8F0] hover:border-[#12283F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <IconoBusquedaVacia />

            <p className="text-[#334155] font-semibold text-sm mt-4">
              {productos.length === 0
                ? 'Aún no hay productos cargados.'
                : 'No encontramos productos con ese filtro'}
            </p>

            {productos.length > 0 && (
              <>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Prueba con otra palabra o revisa otra categoría.
                </p>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="mt-4 text-xs font-semibold text-[#12283F] border border-[#CBD5E1] rounded-full px-4 py-1.5 hover:bg-white transition-colors"
                >
                  Quitar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {productosFiltrados.map((producto) => {
              const itemCarrito = items.find(
                (item) => item.id === producto.id
              )

              const nuevo = esProductoNuevo(producto.created_at)
              const animando = recienAgregado === producto.id

              return (
                <div
                  key={producto.id}
                  className={`group bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                    animando ? 'ring-2 ring-[#12283F]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setProductoSeleccionado(producto)}
                    className="w-full text-left cursor-pointer"
                    aria-label={`Ver detalles de ${producto.nombre}`}
                  >
                    <div className="h-0.5 bg-transparent group-hover:bg-[#1C3D5F] transition-colors" />

                    <div className="aspect-square bg-[#F5F7FA] overflow-hidden relative">
                      {nuevo && (
                        <span className="absolute top-2 left-2 z-10 bg-[#12283F] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
                          Nuevo
                        </span>
                      )}

                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs uppercase tracking-wide">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {producto.categoria && (
                        <p className="text-[#94A3B8] text-[10px] font-semibold uppercase tracking-wider mb-1">
                          {producto.categoria}
                        </p>
                      )}

                      <h3 className="text-[#12283F] font-semibold text-sm leading-snug">
                        {producto.nombre}
                      </h3>

                      {producto.descripcion && (
                        <p className="text-[#64748B] text-xs mt-1 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}

                      <p className="text-[#12283F] font-bold text-base mt-2">
                        ${producto.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </button>

                  <div className="px-4 pb-4">
                    {!itemCarrito ? (
                      <button
                        type="button"
                        onClick={() => manejarAgregar(producto)}
                        className={`w-full bg-[#12283F] text-white text-xs font-semibold py-2.5 rounded-md hover:bg-[#1C3D5F] transition-all duration-200 ${
                          animando ? 'scale-95' : 'scale-100'
                        }`}
                      >
                        {animando
                          ? '✓ Agregado'
                          : '+ Agregar al pedido'}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between border border-[#E2E8F0] rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            disminuirCantidad(producto.id)
                          }
                          className="w-10 h-9 flex items-center justify-center text-[#12283F] hover:bg-[#F5F7FA] font-bold"
                          aria-label={`Disminuir cantidad de ${producto.nombre}`}
                        >
                          −
                        </button>

                        <span className="text-sm font-semibold text-[#12283F]">
                          {itemCarrito.cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            aumentarCantidad(producto.id)
                          }
                          className="w-10 h-9 flex items-center justify-center text-[#12283F] hover:bg-[#F5F7FA] font-bold"
                          aria-label={`Aumentar cantidad de ${producto.nombre}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* MODAL / DETALLE DEL PRODUCTO */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={cerrarDetalle}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cerrarDetalle}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#12283F] hover:bg-[#F5F7FA] transition-colors"
              aria-label="Cerrar detalle"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#F5F7FA] min-h-80 md:min-h-130 flex items-center justify-center relative">
                {esProductoNuevo(productoSeleccionado.created_at) && (
                  <span className="absolute top-4 left-4 bg-[#12283F] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
                    Nuevo
                  </span>
                )}

                {productoSeleccionado.imagen_url ? (
                  <img
                    src={productoSeleccionado.imagen_url}
                    alt={productoSeleccionado.nombre}
                    className="w-full h-full max-h-130 object-contain"
                  />
                ) : (
                  <div className="text-[#94A3B8] text-sm uppercase tracking-wide">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="p-7 md:p-10 flex flex-col">
                {productoSeleccionado.categoria && (
                  <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest mb-3">
                    {productoSeleccionado.categoria}
                  </p>
                )}

                <h2
                  className="text-[#12283F] text-3xl md:text-4xl leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {productoSeleccionado.nombre}
                </h2>

                <div className="w-12 h-1 bg-[#12283F] mt-5 mb-6 rounded-full" />

                <p className="text-[#12283F] text-2xl font-bold">
                  $
                  {productoSeleccionado.precio.toLocaleString('es-CO')}
                </p>

                <div className="mt-7">
                  <h3 className="text-[#12283F] text-sm font-semibold uppercase tracking-wide mb-2">
                    Descripción
                  </h3>

                  <p className="text-[#64748B] text-sm leading-relaxed">
                    {productoSeleccionado.descripcion ||
                      'No hay una descripción disponible para este producto.'}
                  </p>
                </div>

                <div className="mt-auto pt-8">
                  {!items.find(
                    (item) => item.id === productoSeleccionado.id
                  ) ? (
                    <button
                      type="button"
                      onClick={manejarAgregarDesdeDetalle}
                      className="w-full bg-[#12283F] text-white font-semibold py-3.5 rounded-lg hover:bg-[#1C3D5F] transition-colors"
                    >
                      {recienAgregado === productoSeleccionado.id
                        ? '✓ Agregado al pedido'
                        : '+ Agregar al pedido'}
                    </button>
                  ) : (
                    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            disminuirCantidad(
                              productoSeleccionado.id
                            )
                          }
                          className="w-14 h-12 flex items-center justify-center text-[#12283F] text-xl font-bold hover:bg-[#F5F7FA]"
                        >
                          −
                        </button>

                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">
                            Cantidad
                          </p>

                          <span className="text-lg font-semibold text-[#12283F]">
                            {
                              items.find(
                                (item) =>
                                  item.id === productoSeleccionado.id
                              )?.cantidad
                            }
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            aumentarCantidad(
                              productoSeleccionado.id
                            )
                          }
                          className="w-14 h-12 flex items-center justify-center text-[#12283F] text-xl font-bold hover:bg-[#F5F7FA]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={cerrarDetalle}
                  className="w-full mt-3 py-3 text-sm text-[#64748B] hover:text-[#12283F] transition-colors"
                >
                  ← Volver al catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ola divisoria */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="w-full h-15 sm:h-22.5"
        >
          <path
            fill="#12283F"
            d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
          />
        </svg>
      </div>

      {/* Footer */}
      <footer className="bg-[#12283F] text-white pt-4 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <img
              src="/logo.png"
              alt="Barberworld"
              className="h-14 w-auto object-contain mb-4 brightness-0 invert"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />

            <p className="text-white/70 text-sm leading-relaxed">
              Somos una tienda de productos de{' '}
              <span className="text-white font-medium">
                Barbería
              </span>
              ,{' '}
              <span className="text-white font-medium">
                peluquería
              </span>{' '}
              y{' '}
              <span className="text-white font-medium">
                cuidado personal
              </span>{' '}
              con más de{' '}
              <span className="text-white font-medium">
                20 años de experiencia
              </span>{' '}
              en el mercado.
            </p>

            <div className="flex gap-2 mt-4">
              {redesSociales.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.nombre}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white hover:text-[#12283F] transition-colors"
                >
                  {red.icono}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">
              Información de contacto
            </h4>

            <ul className="text-white/70 text-sm space-y-2">
              <li>
                Teléfono{' '}
                <a
                  href="tel:3223320949"
                  className="underline hover:text-white"
                >
                  3223320949
                </a>
              </li>

              <li>
                Email{' '}
                <a
                  href="mailto:barberworldstore@gmail.com"
                  className="underline hover:text-white"
                >
                  barberworldstore@gmail.com
                </a>
              </li>

              <li>
                Dirección{' '}
                <span className="underline">
                  Calle 8 #20-30
                </span>
              </li>

              <li>C.C Siete Mares Oficina 206-207</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">
              Políticas
            </h4>

            <ul className="text-white/70 text-sm space-y-2">
              <li
                className="hover:text-white cursor-pointer"
                onClick={() => abrirPolitica('contacto')}
              >
                Información de contacto
              </li>

              <li
                className="hover:text-white cursor-pointer"
                onClick={() => abrirPolitica('privacidad')}
              >
                Políticas de privacidad
              </li>

              <li
                className="hover:text-white cursor-pointer"
                onClick={() => abrirPolitica('reembolso')}
              >
                Políticas de reembolso
              </li>

              <li
                className="hover:text-white cursor-pointer"
                onClick={() => abrirPolitica('envio')}
              >
                Políticas de envío
              </li>

              <li
                className="hover:text-white cursor-pointer"
                onClick={() => abrirPolitica('terminos')}
              >
                Términos de servicio
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">
              Mantente actualizado
            </h4>

            <p className="text-white/70 text-sm mb-3">
              ¡Regístrate y mantente actualizado de nuevos
              lanzamientos, promociones y eventos!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setEmail('')
              }}
              className="flex items-center bg-white/10 rounded-full pl-4 pr-1 py-1"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="bg-transparent text-sm placeholder-white/50 flex-1 outline-none py-1.5"
              />

              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-white text-[#12283F] flex items-center justify-center shrink-0"
                aria-label="Suscribirme"
              >
                →
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-3">
            Formas de pago
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1F72CD] text-white text-[11px] font-semibold px-3 py-1.5 rounded">
              AMEX
            </span>

            <span className="bg-white text-[#12283F] text-[11px] font-semibold px-3 py-1.5 rounded">
              DINERS
            </span>

            <span className="bg-[#1A1F71] text-white text-[11px] font-semibold px-3 py-1.5 rounded">
              MASTERCARD
            </span>

            <span className="bg-[#1A1F71] text-white text-[11px] font-semibold px-3 py-1.5 rounded">
              VISA
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-6 pt-6 border-t border-white/10 text-white/50 text-xs text-center">
          © {new Date().getFullYear()} Barberworld · Catálogo de proveedores
        </div>
      </footer>

      {/* Modal de Políticas */}
      <PoliticasModal
        politica={politicaAbierta}
        onCerrar={() => setPoliticaAbierta(null)}
      />
    </div>
  )
}