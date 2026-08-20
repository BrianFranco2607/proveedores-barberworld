'use client'

import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../lib/supabase'
import TablaProductos from '../components/TablaProductos'

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

type Pedido = {
  id: string
  nombre_cliente: string
  telefono: string
  email: string | null
  ciudad: string
  direccion: string
  notas: string | null
  total: number
  estado: string
  created_at: string
}

type PedidoItem = {
  id: string
  pedido_id: string
  producto_id: string
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

type ProductoVendido = {
  nombre: string
  cantidad: number
  ventas: number
}

type VentaDia = {
  fecha: string
  total: number
  pedidos: number
}

type FormData = {
  nombre: string
  descripcion: string
  precio: string
  imagen_url: string
  categoria: string
  activo: boolean
}

const supabase = createClient()

function formatearConPuntos(valor: string): string {
  const soloNumeros = valor.replace(/\D/g, '')
  if (!soloNumeros) return ''
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function quitarPuntos(valor: string): string {
  return valor.replace(/\./g, '')
}

function formatearPrecio(valor: number): string {
  return (
    '$' +
    Number(valor || 0)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  )
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function obtenerUltimos7Dias(): string[] {
  const dias: string[] = []
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    fecha.setDate(fecha.getDate() - i)
    dias.push(fecha.toISOString().split('T')[0])
  }
  return dias
}

function formatearDiaCorto(fecha: string): string {
  const fechaObj = new Date(`${fecha}T12:00:00`)
  return fechaObj.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
  })
}

function esPedidoCancelado(pedido: Pedido): boolean {
  return String(pedido.estado || '').trim().toLowerCase() === 'cancelado'
}

function colorEstado(estado: string): string {
  switch (String(estado || '').trim().toLowerCase()) {
    case 'pendiente':
      return 'bg-amber-100 text-amber-800'
    case 'confirmado':
      return 'bg-blue-100 text-blue-800'
    case 'entregado':
      return 'bg-green-100 text-green-800'
    case 'cancelado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function AdminPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([])

  const [loading, setLoading] = useState(false)
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([])
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    categoria: '',
    activo: true,
  })

  const [ventasTotales, setVentasTotales] = useState(0)
  const [pedidosTotales, setPedidosTotales] = useState(0)
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const [pedidosEntregados, setPedidosEntregados] = useState(0)
  const [ventas7Dias, setVentas7Dias] = useState<VentaDia[]>([])
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([])

  useEffect(() => {
    cargarTodo()
  }, [])

  const cargarTodo = async (): Promise<void> => {
    await Promise.all([cargarProductos(), cargarDashboard()])
  }

  const cargarProductos = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const data: Producto[] = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
        const cats = data
          .map((p) => p.categoria)
          .filter((c): c is string => c !== null && c.trim() !== '')
        setCategorias([...new Set(cats)].sort())
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarDashboard = async (): Promise<void> => {
    setLoadingDashboard(true)
    try {
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (pedidosError) {
        console.error('Error cargando pedidos:', pedidosError)
        return
      }

      const pedidosActuales = (pedidosData || []) as Pedido[]
      setPedidos(pedidosActuales)

      const pedidosValidos = pedidosActuales.filter((pedido) => !esPedidoCancelado(pedido))

      const ventas = pedidosValidos.reduce(
        (total, pedido) => total + Number(pedido.total || 0),
        0
      )
      setVentasTotales(ventas)

      setPedidosTotales(pedidosActuales.length)

      setPedidosPendientes(
        pedidosActuales.filter(
          (pedido) => String(pedido.estado).trim().toLowerCase() === 'pendiente'
        ).length
      )

      setPedidosEntregados(
        pedidosActuales.filter(
          (pedido) => String(pedido.estado).trim().toLowerCase() === 'entregado'
        ).length
      )

      const ultimos7Dias = obtenerUltimos7Dias()

      const resumen7Dias: VentaDia[] = ultimos7Dias.map((fecha) => {
        const pedidosDia = pedidosValidos.filter((pedido) => {
          const fechaPedido = new Date(pedido.created_at).toISOString().split('T')[0]
          return fechaPedido === fecha
        })

        return {
          fecha,
          total: pedidosDia.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0),
          pedidos: pedidosDia.length,
        }
      })

      setVentas7Dias(resumen7Dias)

      const { data: itemsData, error: itemsError } = await supabase
        .from('pedido_items')
        .select('*')

      if (itemsError) {
        console.error('Error cargando items:', itemsError)
        return
      }

      const items = (itemsData || []) as PedidoItem[]

      const pedidosValidosIds = new Set(pedidosValidos.map((pedido) => pedido.id))

      const itemsValidos = items.filter((item) => pedidosValidosIds.has(item.pedido_id))
      setPedidoItems(itemsValidos)

      const ranking: Record<string, ProductoVendido> = {}

      itemsValidos.forEach((item) => {
        const nombre = item.nombre_producto
        if (!ranking[nombre]) {
          ranking[nombre] = { nombre, cantidad: 0, ventas: 0 }
        }
        ranking[nombre].cantidad += Number(item.cantidad || 0)
        ranking[nombre].ventas += Number(item.subtotal || 0)
      })

      const rankingOrdenado = Object.values(ranking)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)

      setProductosVendidos(rankingOrdenado)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    try {
      const categoriaFinal = creandoCategoria
        ? nuevaCategoria.trim()
        : formData.categoria.trim()

      if (creandoCategoria && !categoriaFinal) {
        alert('Escribe el nombre de la nueva categoría')
        setLoading(false)
        return
      }

      if (creandoCategoria) {
        const categoriaExistente = categorias.find(
          (categoria) => categoria.trim().toLowerCase() === categoriaFinal.toLowerCase()
        )
        if (categoriaExistente) {
          alert(`La categoría "${categoriaExistente}" ya existe. Selecciónala de la lista.`)
          setLoading(false)
          return
        }
      }

      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'

      const datos = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        precio: parseFloat(quitarPuntos(formData.precio)) || 0,
        imagen_url: formData.imagen_url || '',
        categoria: categoriaFinal || '',
        activo: formData.activo,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })

      if (res.ok) {
        resetForm()
        await cargarProductos()
      } else {
        const error = await res.json()
        alert('Error: ' + (error.error || 'Error al guardar'))
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Producto): void => {
    setEditingId(product.id)
    setMostrarForm(true)
    setCreandoCategoria(false)
    setNuevaCategoria('')

    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: formatearConPuntos(String(product.precio)),
      imagen_url: product.imagen_url || '',
      categoria: product.categoria || '',
      activo: product.activo,
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePrecioChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      precio: formatearConPuntos(e.target.value),
    }))
  }

  const handleImagenChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendoImagen(true)
    try {
      const nombreArchivo = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('productos-fotos')
        .upload(nombreArchivo, file)

      if (error) {
        alert('Error subiendo la imagen: ' + error.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('productos-fotos')
        .getPublicUrl(data.path)

      setFormData((prev) => ({ ...prev, imagen_url: urlData.publicUrl }))
    } catch (error) {
      console.error(error)
      alert('Error subiendo la imagen')
    } finally {
      setSubiendoImagen(false)
      e.target.value = ''
    }
  }

  const quitarImagen = (): void => {
    setFormData((prev) => ({ ...prev, imagen_url: '' }))
  }

  const resetForm = (): void => {
    setEditingId(null)
    setMostrarForm(false)
    setCreandoCategoria(false)
    setNuevaCategoria('')
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen_url: '',
      categoria: '',
      activo: true,
    })
  }

  const productosActivos = products.filter((product) => product.activo).length

  const maxVentas7Dias = Math.max(...ventas7Dias.map((dia) => dia.total), 1)

  const ventasHoy = ventas7Dias[ventas7Dias.length - 1]?.total || 0
  const pedidosHoy = ventas7Dias[ventas7Dias.length - 1]?.pedidos || 0

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* HEADER */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 md:px-10 py-6 flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0">
          <Image src="/logo.png" alt="Barberworld" fill sizes="64px" className="object-contain" priority />
        </div>

        <div className="flex-1">
          <h1
            className="text-3xl md:text-4xl text-[#12283F] leading-none tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            BARBERWORLD
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">Panel de administración</p>
        </div>

        <Link
          href="/admin/pedidos"
          className="hidden sm:block text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-[#F5F7FA] transition-colors"
        >
          Ver pedidos
        </Link>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-10">

        {/* DASHBOARD */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#12283F]">Dashboard</h2>
              <p className="text-sm text-[#64748B] mt-1">Resumen general de Barberworld</p>
            </div>

            <button
              type="button"
              onClick={cargarTodo}
              disabled={loadingDashboard}
              className="self-start sm:self-auto text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
            >
              {loadingDashboard ? 'Actualizando...' : '↻ Actualizar'}
            </button>
          </div>

          {loadingDashboard ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#12283F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* TARJETAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                <div className="bg-[#12283F] text-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Ventas</p>
                      <p className="text-2xl font-extrabold mt-2">{formatearPrecio(ventasTotales)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">$</div>
                  </div>
                  <p className="text-xs text-white/60 mt-4">Pedidos no cancelados</p>
                </div>

                <Link
                  href="/admin/pedidos"
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Pedidos</p>
                      <p className="text-2xl font-extrabold text-[#12283F] mt-2">{pedidosTotales}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-lg">🛒</div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-4">Ver todos los pedidos →</p>
                </Link>

                <Link
                  href="/admin/pedidos"
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Pendientes</p>
                      <p className="text-2xl font-extrabold text-[#12283F] mt-2">{pedidosPendientes}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-lg">⏳</div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-4">Requieren atención</p>
                </Link>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Entregados</p>
                      <p className="text-2xl font-extrabold text-[#12283F] mt-2">{pedidosEntregados}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-lg">✓</div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-4">Pedidos completados</p>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Productos activos</p>
                      <p className="text-2xl font-extrabold text-[#12283F] mt-2">{productosActivos}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg">📦</div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-4">Disponibles en la tienda</p>
                </div>

              </div>

              {/* SEGUNDA FILA */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

                {/* GRÁFICA */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-[#12283F]">Ventas últimos 7 días</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">Rendimiento reciente</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">Hoy</p>
                      <p className="font-bold text-[#12283F]">{formatearPrecio(ventasHoy)}</p>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 h-52">
                    {ventas7Dias.map((dia) => {
                      const altura = (dia.total / maxVentas7Dias) * 100
                      return (
                        <div key={dia.fecha} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                          <div className="text-[10px] font-semibold text-[#64748B]">
                            {dia.total > 0 ? formatearPrecio(dia.total) : ''}
                          </div>
                          <div className="w-full h-36 flex items-end">
                            <div
                              className="w-full bg-[#12283F] rounded-t-md min-h-[4px] transition-all"
                              style={{ height: `${Math.max(altura, dia.total > 0 ? 5 : 0)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-[#94A3B8] capitalize text-center">
                            {formatearDiaCorto(dia.fecha)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex justify-between text-xs text-[#64748B]">
                    <span>{pedidosHoy} {pedidosHoy === 1 ? 'pedido' : 'pedidos'} hoy</span>
                    <span>Últimos 7 días</span>
                  </div>
                </div>

                {/* MÁS VENDIDOS */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="font-bold text-[#12283F]">Productos más vendidos</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">Por cantidad vendida</p>
                  </div>

                  {productosVendidos.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm text-[#64748B]">Todavía no hay ventas.</p>
                      <p className="text-xs text-[#94A3B8] mt-1">Aquí aparecerán tus productos.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productosVendidos.map((producto, index) => (
                        <div key={producto.nombre}>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 shrink-0 rounded-full bg-[#F5F7FA] flex items-center justify-center text-xs font-bold text-[#12283F]">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#12283F] truncate">{producto.nombre}</p>
                              <p className="text-xs text-[#94A3B8]">{producto.cantidad} vendidos</p>
                            </div>
                            <p className="text-xs font-bold text-[#12283F] shrink-0">
                              {formatearPrecio(producto.ventas)}
                            </p>
                          </div>
                          <div className="ml-10 mt-2 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#12283F] rounded-full"
                              style={{
                                width: `${(producto.cantidad / (productosVendidos[0]?.cantidad || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PEDIDOS RECIENTES */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mt-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-[#12283F]">Pedidos recientes</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">Últimas órdenes recibidas</p>
                  </div>
                  <Link href="/admin/pedidos" className="text-xs font-semibold text-[#12283F] hover:underline">
                    Ver todos →
                  </Link>
                </div>

                {pedidos.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-[#64748B]">Aún no hay pedidos.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[650px]">
                      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-4 pb-3 border-b border-[#E2E8F0] text-[10px] uppercase tracking-wide font-bold text-[#94A3B8]">
                        <span>Cliente</span>
                        <span>Fecha</span>
                        <span>Estado</span>
                        <span>Total</span>
                        <span className="text-right">Acción</span>
                      </div>
                      <div>
                        {pedidos.slice(0, 5).map((pedido) => (
                          <div
                            key={pedido.id}
                            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center px-4 py-4 border-b border-[#F1F5F9] last:border-b-0"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#12283F]">{pedido.nombre_cliente}</p>
                              <p className="text-xs text-[#94A3B8] mt-0.5">{pedido.ciudad}</p>
                            </div>
                            <p className="text-xs text-[#64748B]">{formatearFecha(pedido.created_at)}</p>
                            <span
                              className={`inline-flex w-fit text-[10px] font-bold px-2.5 py-1 rounded-full ${colorEstado(
                                pedido.estado
                              )}`}
                            >
                              {pedido.estado}
                            </span>
                            <p className="text-sm font-extrabold text-[#12283F]">{formatearPrecio(pedido.total)}</p>
                            <div className="text-right">
                              <Link href="/admin/pedidos" className="text-xs font-semibold text-[#12283F] hover:underline">
                                Ver pedido
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* PRODUCTOS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[#12283F] font-bold text-lg">
                Productos <span className="text-[#94A3B8] font-normal">({products.length})</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">Gestiona el catálogo de Barberworld</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/pedidos"
                className="text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-white transition-colors"
              >
                Ver pedidos
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (mostrarForm && !editingId) {
                    resetForm()
                  } else {
                    resetForm()
                    setMostrarForm(true)
                  }
                }}
                className="bg-[#12283F] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1C3D5F] transition-colors shadow-sm"
              >
                {mostrarForm && !editingId ? 'Cancelar' : '+ Añadir producto'}
              </button>
            </div>
          </div>

          {/* FORMULARIO */}
          {mostrarForm && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 mb-10 shadow-sm">
              <h3 className="text-[#12283F] font-bold text-lg mb-6">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del producto"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Categoría</label>

                  {!creandoCategoria ? (
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={(e) => {
                        if (e.target.value === '__nueva__') {
                          setCreandoCategoria(true)
                          setFormData((prev) => ({ ...prev, categoria: '' }))
                        } else {
                          handleInputChange(e)
                        }
                      }}
                      className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-[#12283F] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
                    >
                      <option value="">Selecciona una categoría</option>

                      <optgroup label="━ Categorías mayoristas ━">
                        <option value="Peluqueras">Peluqueras</option>
                        <option value="Patilleras">Patilleras</option>
                        <option value="Afeitadoras">Afeitadoras</option>
                        <option value="Trimmers de Nariz">Trimmers de Nariz</option>
                        <option value="Secadores">Secadores</option>
                        <option value="Secadores y cepillo secador">Secadores y cepillo secador</option>
                        <option value="Rizadoras, pinzas y conos">Rizadoras, pinzas y conos</option>
                        <option value="Planchas">Planchas</option>
                        <option value="Tijeras">Tijeras</option>
                        <option value="Barberas y Minoras">Barberas y Minoras</option>
                        <option value="Cabezotes">Cabezotes</option>
                        <option value="Guias de Corte">Guias de Corte</option>
                        <option value="Ceras">Ceras</option>
                        <option value="Geles, balsamos y cremas de peinar">Geles, balsamos y cremas de peinar</option>
                        <option value="Lacas">Lacas</option>
                        <option value="Shampoos y Acondicionadores">Shampoos y Acondicionadores</option>
                        <option value="Keratinas, serums y tratamientos capilares">Keratinas, serums y tratamientos capilares</option>
                        <option value="Voluminizantes">Voluminizantes</option>
                        <option value="Pigmentos, fibras, tintes y aerografos">Pigmentos, fibras, tintes y aerografos</option>
                        <option value="After Shave">After Shave</option>
                        <option value="Shaving Gel">Shaving Gel</option>
                        <option value="Talcos">Talcos</option>
                        <option value="Cremas, exfoliantes y vaselinas">Cremas, exfoliantes y vaselinas</option>
                        <option value="Mascarillas, velos y tratamientos faciales">Mascarillas, velos y tratamientos faciales</option>
                        <option value="Barba">Barba</option>
                        <option value="Tatuajes">Tatuajes</option>
                        <option value="Capas">Capas</option>
                        <option value="Cuelleros, toallas y paños">Cuelleros, toallas y paños</option>
                        <option value="Atomizadores, pulverizadores y sprays">Atomizadores, pulverizadores y sprays</option>
                        <option value="Brochas, talqueras y sacudidores">Brochas, talqueras y sacudidores</option>
                        <option value="Peinillas">Peinillas</option>
                        <option value="Cepillos">Cepillos</option>
                        <option value="Tapetes, bases y puesto de trabajo">Tapetes, bases y puesto de trabajo</option>
                        <option value="Caimanes, pinzas y sujetadores">Caimanes, pinzas y sujetadores</option>
                        <option value="Maletas, gorras y accesorios">Maletas, gorras y accesorios</option>
                        <option value="Repuestos">Repuestos</option>
                        <option value="Lubricantes, Aceites y Mantenimiento">Lubricantes, Aceites y Mantenimiento</option>
                        <option value="Combos">Combos</option>
                        <option value="Otros">Otros</option>
                        <option value="Remates">Remates</option>
                        <option value="Minoxidil">Minoxidil</option>
                        <option value="Ollas de cera y depilacion">Ollas de cera y depilacion</option>
                        <option value="Pulidores, drill y uñas">Pulidores, drill y uñas</option>
                        <option value="Cortadoras">Cortadoras</option>
                      </optgroup>

                      {categorias.length > 0 && (
                        <optgroup label="━ Categorías existentes ━">
                          {categorias.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                      )}

                      <option value="__nueva__">+ Crear nueva categoría</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        placeholder="Ej: Máquinas, Cuchillas, Shampoos..."
                        autoFocus
                        className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCreandoCategoria(false)
                          setNuevaCategoria('')
                        }}
                        className="text-xs font-semibold text-[#64748B] hover:text-[#12283F] hover:underline"
                      >
                        ← Volver a categorías existentes
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Precio (COP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-medium">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="precio"
                      placeholder="15.000"
                      value={formData.precio}
                      onChange={handlePrecioChange}
                      className="w-full border border-[#CBD5E1] rounded-lg pl-8 pr-4 py-2.5 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Foto</label>

                  {formData.imagen_url ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.imagen_url}
                        alt="Vista previa"
                        className="w-16 h-16 object-cover rounded-lg border border-[#CBD5E1]"
                      />
                      <div>
                        <label
                          htmlFor="input-foto"
                          className="text-[#12283F] text-xs font-semibold hover:underline cursor-pointer inline-block"
                        >
                          {subiendoImagen ? 'Subiendo...' : 'Cambiar foto'}
                        </label>
                        <button
                          type="button"
                          onClick={quitarImagen}
                          className="text-red-600 text-xs font-semibold hover:underline block mt-1"
                        >
                          Quitar foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="input-foto"
                      className="flex items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-lg py-3 cursor-pointer hover:border-[#12283F] text-[#64748B] text-sm font-medium transition-colors"
                    >
                      {subiendoImagen ? 'Subiendo...' : 'Clic para subir imagen'}
                    </label>
                  )}

                  <input
                    id="input-foto"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    disabled={subiendoImagen}
                    className="hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción del producto"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 text-[#12283F] font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#12283F] focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || subiendoImagen}
                    className="bg-[#12283F] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1C3D5F] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingId ? 'Actualizar producto' : 'Guardar producto'}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-[#CBD5E1] text-[#334155] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#F5F7FA] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE PRODUCTOS (TABLA) */}
          {loading && products.length === 0 ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#12283F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TablaProductos
              productos={products}
              onEditar={handleEdit}
              onRecargar={cargarProductos}
            />
          )}
        </section>
      </div>
    </div>
  )
}
