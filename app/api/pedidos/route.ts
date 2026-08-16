import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase-admin';

export async function GET() {
  try {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error de base de datos: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(pedidos);

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno: ' + mensajeError },
      { status: 500 }
    );
  }
}