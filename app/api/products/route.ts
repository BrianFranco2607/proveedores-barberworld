import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../lib/supabase-admin';

export async function GET() {
  try {
    const TAMANO = 1000;
    let desde = 0;
    const todos: unknown[] = [];

    for (;;) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })
        .range(desde, desde + TAMANO - 1);

      if (error) {
        return NextResponse.json(
          { error: 'Error de base de datos: ' + error.message },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) break;

      todos.push(...data);

      if (data.length < TAMANO) break;
      desde += TAMANO;
    }

    return NextResponse.json(todos);

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno: ' + mensajeError },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, precio, imagen_url, categoria, activo } = body;

    if (!nombre || precio === undefined) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      );
    }

    const nuevoProducto = {
      nombre: String(nombre),
      descripcion: descripcion || null,
      precio: Number(precio),
      imagen_url: imagen_url || null,
      categoria: categoria || null,
      activo: activo !== undefined ? activo : true
    };

    const { data: product, error } = await supabase
      .from('productos')
      .insert(nuevoProducto)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Error de base de datos: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(product[0], { status: 201 });

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno: ' + mensajeError },
      { status: 500 }
    );
  }
}