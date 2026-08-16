import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin'

type Params = {
  params: Promise<{
    id: string
  }>
}

/*
 * =========================================================
 * PUT
 * Editar producto / activar / desactivar producto
 * =========================================================
 */

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params

    console.log('=================================')
    console.log('PUT /api/products/[id]')
    console.log('ID:', id)

    const body = await request.json()

    const {
      nombre,
      descripcion,
      precio,
      imagen_url,
      categoria,
      activo,
    } = body

    console.log('Datos recibidos:', {
      nombre,
      descripcion,
      precio,
      imagen_url,
      categoria,
      activo,
    })

    if (!id) {
      return NextResponse.json(
        {
          error: 'ID del producto requerido',
        },
        { status: 400 }
      )
    }

    if (!nombre || precio === undefined) {
      return NextResponse.json(
        {
          error: 'Nombre y precio son requeridos',
        },
        { status: 400 }
      )
    }

    const datosActualizar = {
      nombre: String(nombre),
      descripcion:
        descripcion?.trim()
          ? String(descripcion)
          : null,
      precio: Number(precio),
      imagen_url:
        imagen_url?.trim()
          ? String(imagen_url)
          : null,
      categoria:
        categoria?.trim()
          ? String(categoria)
          : null,
      activo:
        activo !== undefined
          ? Boolean(activo)
          : true,
    }

    console.log(
      'Actualizando producto:',
      datosActualizar
    )

    const {
      data: producto,
      error,
    } = await supabase
      .from('productos')
      .update(datosActualizar)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(
        'Error de Supabase:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Error de base de datos: ' +
            error.message,
        },
        { status: 500 }
      )
    }

    if (!producto) {
      console.error(
        'Producto no encontrado:',
        id
      )

      return NextResponse.json(
        {
          error:
            'Producto no encontrado',
        },
        { status: 404 }
      )
    }

    console.log(
      'Producto actualizado correctamente:',
      producto
    )

    return NextResponse.json(
      producto,
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'Error en PUT:',
      error
    )

    const mensajeError =
      error instanceof Error
        ? error.message
        : 'Error desconocido'

    return NextResponse.json(
      {
        error:
          'Error interno: ' +
          mensajeError,
      },
      { status: 500 }
    )
  }
}


/*
 * =========================================================
 * DELETE
 * Eliminar producto
 * =========================================================
 */

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params

    console.log('=================================')
    console.log('DELETE /api/products/[id]')
    console.log('ID:', id)

    if (!id) {
      return NextResponse.json(
        {
          error:
            'ID del producto requerido',
        },
        { status: 400 }
      )
    }

    const {
      data: producto,
      error: buscarError,
    } = await supabase
      .from('productos')
      .select('id')
      .eq('id', id)
      .single()

    if (buscarError) {
      console.error(
        'Error buscando producto:',
        buscarError
      )

      return NextResponse.json(
        {
          error:
            'Error buscando producto: ' +
            buscarError.message,
        },
        { status: 500 }
      )
    }

    if (!producto) {
      return NextResponse.json(
        {
          error:
            'Producto no encontrado',
        },
        { status: 404 }
      )
    }

    const { error } =
      await supabase
        .from('productos')
        .delete()
        .eq('id', id)

    if (error) {
      console.error(
        'Error eliminando producto:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Error de base de datos: ' +
            error.message,
        },
        { status: 500 }
      )
    }

    console.log(
      'Producto eliminado correctamente:',
      id
    )

    return NextResponse.json({
      success: true,
      message:
        'Producto eliminado exitosamente',
    })
  } catch (error) {
    console.error(
      'Error en DELETE:',
      error
    )

    const mensajeError =
      error instanceof Error
        ? error.message
        : 'Error desconocido'

    return NextResponse.json(
      {
        error:
          'Error interno: ' +
          mensajeError,
      },
      { status: 500 }
    )
  }
}