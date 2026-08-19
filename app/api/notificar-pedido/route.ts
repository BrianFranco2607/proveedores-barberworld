import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatearPrecio(valor: number): string {
  return '$' + Number(valor || 0).toLocaleString('es-CO')
}

type ItemNotificacion = {
  nombre: string
  cantidad: number
  precio: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pedidoId,
      nombreCliente,
      telefono,
      email,
      ciudad,
      direccion,
      notas,
      total,
      items,
    } = body

    const filasProductos = (items as ItemNotificacion[])
      .map(
        (item) =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #E2E8F0;">${item.nombre}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #E2E8F0;text-align:center;">${item.cantidad}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #E2E8F0;text-align:right;">${formatearPrecio(item.precio)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #E2E8F0;text-align:right;">${formatearPrecio(item.precio * item.cantidad)}</td>
          </tr>`
      )
      .join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background:#12283F;color:#fff;padding:20px;">
          <h1 style="margin:0;font-size:20px;">Nuevo pedido en Barberworld</h1>
        </div>
        <div style="padding:20px;color:#12283F;">
          <p><strong>Pedido:</strong> ${pedidoId}</p>
          <p><strong>Cliente:</strong> ${nombreCliente}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
          <p><strong>Ciudad:</strong> ${ciudad}</p>
          <p><strong>Dirección:</strong> ${direccion}</p>
          ${notas ? `<p><strong>Notas:</strong> ${notas}</p>` : ''}

          <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
            <thead>
              <tr style="background:#F5F7FA;">
                <th style="padding:6px 8px;text-align:left;">Producto</th>
                <th style="padding:6px 8px;text-align:center;">Cant.</th>
                <th style="padding:6px 8px;text-align:right;">Precio</th>
                <th style="padding:6px 8px;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasProductos}
            </tbody>
          </table>

          <p style="margin-top:16px;font-size:18px;font-weight:bold;">
            Total: ${formatearPrecio(total)}
          </p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: 'Barberworld <onboarding@resend.dev>',
      to: 'barberworldstore@gmail.com',
      subject: `Nuevo pedido de ${nombreCliente} - ${formatearPrecio(total)}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const mensajeError =
      error instanceof Error ? error.message : 'Error desconocido'

    console.error('Error enviando notificación:', mensajeError)

    return NextResponse.json({ error: mensajeError }, { status: 500 })
  }
}
