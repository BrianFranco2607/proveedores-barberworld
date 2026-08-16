'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import { createClient } from '../lib/supabase'
import { useCart } from './CartContext'

type Paso = 'carrito' | 'cliente' | 'exito'

export default function CarritoFlotante() {
  const supabase = createClient()

  const {
    items,
    cantidadTotal,
    total,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    vaciarCarrito,
  } = useCart()

  const [abierto, setAbierto] = useState(false)
  const [paso, setPaso] = useState<Paso>('carrito')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [pedidoIdGenerado, setPedidoIdGenerado] = useState('')
  const [pdfGenerado, setPdfGenerado] = useState(false)

  const [nombreCliente, setNombreCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [notas, setNotas] = useState('')

  function formatearPrecio(valor: number) {
    return `$${Number(valor).toLocaleString('es-CO')}`
  }

  // ============================================================
  // GENERAR PDF
  // ============================================================

  function generarPDFPedido(
    pedidoId: string,
    fecha: Date
  ): boolean {
    try {
      const doc = new jsPDF()

      const margen = 20
      let y = 20

      // ========================================================
      // ENCABEZADO
      // ========================================================

      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('BARBERWORLD', margen, y)

      y += 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Información del pedido', margen, y)

      y += 12

      doc.setDrawColor(200, 200, 200)
      doc.line(margen, y, 190, y)

      y += 10

      // ========================================================
      // INFORMACIÓN DEL PEDIDO
      // ========================================================

      doc.setFontSize(10)

      doc.setFont('helvetica', 'bold')
      doc.text('Pedido:', margen, y)

      doc.setFont('helvetica', 'normal')
      doc.text(String(pedidoId), 55, y)

      y += 7

      doc.setFont('helvetica', 'bold')
      doc.text('Fecha:', margen, y)

      doc.setFont('helvetica', 'normal')
      doc.text(
        fecha.toLocaleString('es-CO'),
        55,
        y
      )

      y += 12

      // ========================================================
      // DATOS DEL CLIENTE
      // ========================================================

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Datos del cliente', margen, y)

      y += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      doc.text(
        `Nombre: ${nombreCliente.trim()}`,
        margen,
        y
      )

      y += 7

      doc.text(
        `Teléfono: ${telefono.trim()}`,
        margen,
        y
      )

      y += 7

      if (email.trim()) {
        doc.text(
          `Email: ${email.trim()}`,
          margen,
          y
        )

        y += 7
      }

      doc.text(
        `Ciudad: ${ciudad.trim()}`,
        margen,
        y
      )

      y += 7

      const direccionDividida = doc.splitTextToSize(
        `Dirección: ${direccion.trim()}`,
        170
      )

      doc.text(
        direccionDividida,
        margen,
        y
      )

      y += direccionDividida.length * 5 + 3

      if (notas.trim()) {
        const notasDivididas = doc.splitTextToSize(
          `Notas: ${notas.trim()}`,
          170
        )

        doc.text(
          notasDivididas,
          margen,
          y
        )

        y += notasDivididas.length * 5 + 5
      }

      y += 8

      // ========================================================
      // PRODUCTOS
      // ========================================================

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Productos', margen, y)

      y += 9

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')

      doc.text('Producto', margen, y)
      doc.text('Cant.', 115, y)
      doc.text('Precio', 135, y)
      doc.text('Subtotal', 165, y)

      y += 6

      doc.line(margen, y, 190, y)

      y += 8

      doc.setFont('helvetica', 'normal')

      items.forEach((item) => {
        const nombreDividido = doc.splitTextToSize(
          item.nombre,
          85
        )

        doc.text(
          nombreDividido,
          margen,
          y
        )

        doc.text(
          String(item.cantidad),
          118,
          y
        )

        doc.text(
          formatearPrecio(item.precio),
          135,
          y
        )

        doc.text(
          formatearPrecio(
            item.precio * item.cantidad
          ),
          165,
          y
        )

        y += Math.max(
          nombreDividido.length * 5,
          7
        )

        // Crear nueva página si es necesario
        if (y > 260) {
          doc.addPage()
          y = 20
        }
      })

      y += 5

      doc.line(margen, y, 190, y)

      y += 10

      // ========================================================
      // TOTAL
      // ========================================================

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')

      doc.text(
        'TOTAL:',
        125,
        y
      )

      doc.text(
        formatearPrecio(total),
        165,
        y
      )

      y += 15

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      doc.text(
        'Gracias por tu pedido en Barberworld.',
        margen,
        y
      )

      y += 6

      doc.text(
        'Por favor envía este PDF por WhatsApp para confirmar tu pedido.',
        margen,
        y
      )

      // ========================================================
      // DESCARGAR PDF
      // ========================================================

      const nombreArchivo =
        `Pedido-Barberworld-${pedidoId}.pdf`

      doc.save(nombreArchivo)

      return true

    } catch (error) {
      console.error(
        'ERROR GENERANDO PDF:',
        error
      )

      return false
    }
  }

  // ============================================================
  // ABRIR WHATSAPP
  // ============================================================

  function abrirWhatsApp() {
    const numeroBarberworld = '573223320949'

    const mensaje =
      `Hola Barberworld 👋\n\n` +
      `Acabo de realizar un pedido.\n\n` +
      `Pedido: ${pedidoIdGenerado}\n` +
      `Nombre: ${nombreCliente.trim()}\n` +
      `Teléfono: ${telefono.trim()}\n` +
      `Total: ${formatearPrecio(total)}\n\n` +
      `Ya descargué el PDF con la información de mi pedido.` +
      `\n\nVoy a adjuntar el PDF en este chat para que puedan confirmar mi pedido.`

    const url =
      `https://wa.me/${numeroBarberworld}?text=${encodeURIComponent(mensaje)}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // ============================================================
  // ABRIR CARRITO
  // ============================================================

  function abrirCarrito() {
    setAbierto(true)
    setPaso('carrito')
    setError('')
  }

  // ============================================================
  // CERRAR CARRITO
  // ============================================================

  function cerrarCarrito() {
    setAbierto(false)

    setTimeout(() => {
      setPaso('carrito')
      setError('')
    }, 300)
  }

  // ============================================================
  // VOLVER AL CARRITO
  // ============================================================

  function volverAlCarrito() {
    setPaso('carrito')
    setError('')
  }

  // ============================================================
  // CONFIRMAR PEDIDO
  // ============================================================

  async function confirmarPedido(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError('')

    if (!nombreCliente.trim()) {
      setError(
        'Ingresa el nombre del cliente.'
      )
      return
    }

    if (!telefono.trim()) {
      setError(
        'Ingresa un número de teléfono o WhatsApp.'
      )
      return
    }

    if (!ciudad.trim()) {
      setError(
        'Ingresa la ciudad.'
      )
      return
    }

    if (!direccion.trim()) {
      setError(
        'Ingresa la dirección de entrega.'
      )
      return
    }

    if (items.length === 0) {
      setError(
        'El pedido está vacío.'
      )
      return
    }

    setGuardando(true)

    try {

      // ========================================================
      // 1. CREAR PEDIDO
      // ========================================================

      const {
        data: pedido,
        error: errorPedido
      } = await supabase
        .from('pedidos')
        .insert({
          nombre_cliente:
            nombreCliente.trim(),

          telefono:
            telefono.trim(),

          email:
            email.trim() || null,

          ciudad:
            ciudad.trim(),

          direccion:
            direccion.trim(),

          notas:
            notas.trim() || null,

          total,

          estado:
            'Pendiente',
        })
        .select('id')
        .single()

      if (errorPedido || !pedido) {
        throw new Error(
          errorPedido?.message ||
          'No se pudo crear el pedido.'
        )
      }

      // ========================================================
      // 2. CREAR ITEMS
      // ========================================================

      const itemsPedido = items.map(
        (item) => ({
          pedido_id:
            pedido.id,

          producto_id:
            item.id,

          nombre_producto:
            item.nombre,

          cantidad:
            item.cantidad,

          precio_unitario:
            item.precio,

          subtotal:
            item.precio *
            item.cantidad,
        })
      )

      const {
        error: errorItems
      } = await supabase
        .from('pedido_items')
        .insert(itemsPedido)

      if (errorItems) {

        await supabase
          .from('pedidos')
          .delete()
          .eq(
            'id',
            pedido.id
          )

        throw new Error(
          'No se pudieron guardar los productos del pedido: ' +
          errorItems.message
        )
      }

      // ========================================================
      // 3. GUARDAR ID DEL PEDIDO
      // ========================================================

      setPedidoIdGenerado(
        pedido.id
      )

      // ========================================================
      // 4. GENERAR PDF
      // ========================================================

      const fechaPedido =
        new Date()

      const pdfOk =
        generarPDFPedido(
          pedido.id,
          fechaPedido
        )

      setPdfGenerado(pdfOk)

      // ========================================================
      // 5. VACIAR CARRITO
      // ========================================================

      vaciarCarrito()

      // ========================================================
      // 6. MOSTRAR ÉXITO
      // ========================================================

      setPaso('exito')

      // ========================================================
      // 7. ABRIR WHATSAPP AUTOMÁTICAMENTE
      //
      // Lo hacemos después de crear el pedido.
      // ========================================================

      setTimeout(() => {

        const numeroBarberworld =
          '573223320949'

        const mensaje =
          `Hola Barberworld 👋\n\n` +
          `Acabo de realizar un pedido.\n\n` +
          `Pedido: ${pedido.id}\n` +
          `Nombre: ${nombreCliente.trim()}\n` +
          `Teléfono: ${telefono.trim()}\n` +
          `Total: ${formatearPrecio(total)}\n\n` +
          `Ya descargué el PDF con la información de mi pedido.` +
          `\n\nVoy a adjuntar el PDF en este chat para que puedan confirmar mi pedido.`

        const whatsappUrl =
          `https://wa.me/${numeroBarberworld}?text=${encodeURIComponent(mensaje)}`

        window.open(
          whatsappUrl,
          '_blank',
          'noopener,noreferrer'
        )

      }, 800)

    } catch (error) {

      console.error(
        'ERROR CREANDO PEDIDO:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error creando el pedido.'
      )

    } finally {

      setGuardando(false)

    }
  }

  // ============================================================
  // SI NO HAY PRODUCTOS
  // ============================================================

  if (
    cantidadTotal === 0 &&
    paso !== 'exito'
  ) {
    return null
  }

  return (
    <>
      {/* ====================================================== */}
      {/* BOTÓN FLOTANTE */}
      {/* ====================================================== */}

      {cantidadTotal > 0 && (

        <button
          type="button"
          onClick={abrirCarrito}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-[#12283F] text-white px-5 py-3 rounded-full shadow-xl hover:bg-[#1C3D5F] transition-all"
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
              d="M3 3h2l2.4 11.2a2 2 0 002 1.6h7.9a2 2 0 001.9-1.4L21 7H6"
            />

            <circle
              cx="10"
              cy="20"
              r="1"
            />

            <circle
              cx="18"
              cy="20"
              r="1"
            />

          </svg>

          <span className="font-semibold text-sm">
            Pedido
          </span>

          <span className="bg-white text-[#12283F] min-w-6 h-6 px-1 rounded-full flex items-center justify-center text-xs font-bold">
            {cantidadTotal}
          </span>

          <span className="font-semibold text-sm">
            {formatearPrecio(total)}
          </span>

        </button>

      )}

      {/* ====================================================== */}
      {/* FONDO */}
      {/* ====================================================== */}

      {abierto && (

        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={cerrarCarrito}
        />

      )}

      {/* ====================================================== */}
      {/* PANEL */}
      {/* ====================================================== */}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          abierto
            ? 'translate-x-0'
            : 'translate-x-full'
        }`}
      >

        {/* ==================================================== */}
        {/* PASO 1 - CARRITO */}
        {/* ==================================================== */}

        {paso === 'carrito' && (

          <>

            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">

              <div>

                <h2 className="text-lg font-bold text-[#12283F]">
                  Tu pedido
                </h2>

                <p className="text-xs text-neutral-500 mt-0.5">
                  {cantidadTotal}{' '}
                  {cantidadTotal === 1
                    ? 'producto'
                    : 'productos'}
                </p>

              </div>

              <button
                type="button"
                onClick={cerrarCarrito}
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Cerrar pedido"
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

            </div>

            <div className="h-[calc(100%-185px)] overflow-y-auto px-5 py-4">

              <div className="flex flex-col gap-4">

                {items.map((item) => (

                  <div
                    key={item.id}
                    className="flex gap-3 border-b border-neutral-100 pb-4"
                  >

                    <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden shrink-0">

                      {item.imagen_url ? (

                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                          Sin imagen
                        </div>

                      )}

                    </div>

                    <div className="flex-1 min-w-0">

                      <h3 className="text-sm font-semibold text-[#12283F] leading-snug">
                        {item.nombre}
                      </h3>

                      <p className="text-sm font-bold text-[#12283F] mt-1">
                        {formatearPrecio(item.precio)}
                      </p>

                      <div className="flex items-center justify-between mt-2">

                        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">

                          <button
                            type="button"
                            onClick={() =>
                              disminuirCantidad(item.id)
                            }
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          >
                            −
                          </button>

                          <span className="w-8 text-center text-sm font-medium">
                            {item.cantidad}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              aumentarCantidad(item.id)
                            }
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          >
                            +
                          </button>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarProducto(item.id)
                          }
                          className="text-xs text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              {items.length > 0 && (

                <button
                  type="button"
                  onClick={vaciarCarrito}
                  className="text-xs text-neutral-500 hover:text-red-600 hover:underline mt-5"
                >
                  Vaciar pedido
                </button>

              )}

            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 py-4">

              <div className="flex items-center justify-between mb-3">

                <span className="text-sm text-neutral-500">
                  Total
                </span>

                <span className="text-xl font-bold text-[#12283F]">
                  {formatearPrecio(total)}
                </span>

              </div>

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setPaso('cliente')
                }}
                className="w-full bg-[#12283F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1C3D5F] transition-colors"
              >
                Continuar pedido
              </button>

            </div>

          </>

        )}

        {/* ==================================================== */}
        {/* PASO 2 - CLIENTE */}
        {/* ==================================================== */}

        {paso === 'cliente' && (

          <div className="h-full flex flex-col">

            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">

              <button
                type="button"
                onClick={volverAlCarrito}
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                aria-label="Volver"
              >
                ←
              </button>

              <div>

                <h2 className="text-lg font-bold text-[#12283F]">
                  Datos de entrega
                </h2>

                <p className="text-xs text-neutral-500 mt-0.5">
                  Completa tus datos para realizar el pedido
                </p>

              </div>

            </div>

            <form
              id="form-datos-cliente"
              onSubmit={confirmarPedido}
              className="flex-1 overflow-y-auto px-5 py-5"
            >

              <div className="space-y-4">

                {/* NOMBRE */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Nombre completo *
                  </label>

                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) =>
                      setNombreCliente(e.target.value)
                    }
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* TELEFONO */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Teléfono / WhatsApp *
                  </label>

                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value)
                    }
                    placeholder="Ej. 300 123 4567"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* CIUDAD */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Ciudad *
                  </label>

                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) =>
                      setCiudad(e.target.value)
                    }
                    placeholder="Ej. Bogotá"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* DIRECCION */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Dirección de entrega *
                  </label>

                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) =>
                      setDireccion(e.target.value)
                    }
                    placeholder="Ej. Calle 123 #45-67"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* NOTAS */}

                <div>

                  <label className="block text-xs font-semibold text-[#12283F] mb-1.5">
                    Notas adicionales
                  </label>

                  <textarea
                    value={notas}
                    onChange={(e) =>
                      setNotas(e.target.value)
                    }
                    rows={3}
                    placeholder="Información adicional sobre la entrega..."
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1C3D5F]"
                  />

                </div>

                {/* ERROR */}

                {error && (

                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-3">
                    {error}
                  </div>

                )}

                {/* RESUMEN */}

                <div className="bg-[#F5F7FA] rounded-lg p-4 mt-5">

                  <div className="flex justify-between text-sm">

                    <span className="text-neutral-500">
                      Productos
                    </span>

                    <span className="font-medium text-[#12283F]">
                      {cantidadTotal}
                    </span>

                  </div>

                  <div className="flex justify-between mt-2">

                    <span className="font-semibold text-[#12283F]">
                      Total
                    </span>

                    <span className="font-bold text-[#12283F]">
                      {formatearPrecio(total)}
                    </span>

                  </div>

                </div>

              </div>

            </form>

            <div className="border-t border-neutral-200 bg-white px-5 py-4">

              <button
                type="submit"
                form="form-datos-cliente"
                disabled={guardando}
                className="w-full bg-[#12283F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1C3D5F] transition-colors disabled:opacity-50"
              >

                {guardando
                  ? 'Procesando pedido...'
                  : 'Confirmar pedido'}

              </button>

            </div>

          </div>

        )}

        {/* ==================================================== */}
        {/* PASO 3 - ÉXITO */}
        {/* ==================================================== */}

        {paso === 'exito' && (

          <div className="h-full flex flex-col items-center justify-center px-8 text-center">

            <div className="w-16 h-16 rounded-full bg-[#12283F] text-white flex items-center justify-center mb-5">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-8 h-8"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />

              </svg>

            </div>

            <h2 className="text-2xl font-bold text-[#12283F]">
              ¡Pedido recibido!
            </h2>

            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
              Tu pedido fue creado correctamente.
            </p>

            <div className="mt-5 w-full bg-[#F5F7FA] rounded-xl p-4 text-left">

              <p className="text-xs text-neutral-500">
                Número de pedido
              </p>

              <p className="text-sm font-bold text-[#12283F] mt-1 break-all">
                {pedidoIdGenerado}
              </p>

            </div>

            {pdfGenerado ? (

              <div className="mt-5 w-full bg-green-50 border border-green-200 rounded-xl p-4 text-left">

                <p className="text-sm font-bold text-green-800">
                  ✓ PDF descargado
                </p>

                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  Busca el archivo que acaba de descargarse y adjúntalo en el chat de WhatsApp con Barberworld.
                </p>

              </div>

            ) : (

              <div className="mt-5 w-full bg-red-50 border border-red-200 rounded-xl p-4 text-left">

                <p className="text-sm font-bold text-red-800">
                  ⚠ No se pudo descargar el PDF
                </p>

                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  El pedido sí fue registrado. Puedes contactar a Barberworld por WhatsApp y proporcionar el número de pedido.
                </p>

              </div>

            )}

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={abrirWhatsApp}
              className="mt-5 w-full bg-[#25D366] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#20bd5a] transition-colors"
            >
              Abrir WhatsApp y enviar pedido
            </button>

            <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
              WhatsApp se abrirá con un mensaje preparado.
              Después debes adjuntar manualmente el PDF descargado.
            </p>

            <button
              type="button"
              onClick={cerrarCarrito}
              className="mt-6 text-sm text-[#12283F] font-semibold hover:underline"
            >
              Seguir viendo productos
            </button>

          </div>

        )}

      </aside>
    </>
  )
}