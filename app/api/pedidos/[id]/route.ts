import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorPedido || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const { data: items, error: errorItems } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', id);

    if (errorItems) {
      return NextResponse.json(
        { error: 'Error cargando productos del pedido: ' + errorItems.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ pedido, items });

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno: ' + mensajeError },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado } = body;

    if (!estado) {
      return NextResponse.json(
        { error: 'El estado es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Error actualizando el pedido: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno: ' + mensajeError },
      { status: 500 }
    );
  }
}