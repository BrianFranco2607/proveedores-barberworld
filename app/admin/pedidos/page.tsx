'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Pedido = {
  id: string;
  nombre_cliente: string;
  telefono: string;
  email: string | null;
  ciudad: string;
  direccion: string;
  notas: string | null;
  total: number;
  estado: string;
  created_at: string;
};

type PedidoItem = {
  id: string;
  producto_id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

const ESTADOS = ['Pendiente', 'Confirmado', 'Entregado', 'Cancelado'];

function formatearPrecio(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);
  const [itemsPedido, setItemsPedido] = useState<PedidoItem[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setCargando(true);
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  }

  async function abrirDetalle(id: string) {
    if (pedidoAbierto === id) {
      setPedidoAbierto(null);
      return;
    }
    setPedidoAbierto(id);
    setCargandoDetalle(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`);
      const data = await res.json();
      setItemsPedido(data.items || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    setCambiandoEstado(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
        );
      } else {
        alert('No se pudo actualizar el estado');
      }
    } catch (error) {
      alert('Error actualizando el estado');
    } finally {
      setCambiandoEstado(false);
    }
  }

  function colorEstado(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-amber-100 text-amber-800';
      case 'Confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
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
          <p className="text-sm text-[#64748B] mt-1 font-medium">Pedidos de proveedores</p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-[#12283F] border border-[#CBD5E1] rounded-lg px-4 py-2 hover:bg-[#F5F7FA] transition-colors"
        >
          ← Productos
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h2 className="text-[#12283F] font-bold text-lg mb-6">
          Pedidos <span className="text-[#94A3B8] font-normal">({pedidos.length})</span>
        </h2>

        {cargando ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#12283F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pedidos.length === 0 ? (
          <p className="text-[#64748B] text-center py-16">Aún no hay pedidos.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => abrirDetalle(pedido.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 text-left hover:bg-[#F5F7FA] transition-colors"
                >
                  <div>
                    <p className="font-bold text-[#12283F] text-sm">{pedido.nombre_cliente}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {pedido.telefono} · {pedido.ciudad}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {formatearFecha(pedido.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colorEstado(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                    <span className="font-extrabold text-[#12283F]">
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>
                </button>

                {pedidoAbierto === pedido.id && (
                  <div className="border-t border-[#E2E8F0] p-5 bg-[#F5F7FA]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                      {pedido.email && (
                        <p><span className="text-[#64748B]">Email:</span> <span className="text-[#12283F] font-medium">{pedido.email}</span></p>
                      )}
                      <p><span className="text-[#64748B]">Dirección:</span> <span className="text-[#12283F] font-medium">{pedido.direccion}</span></p>
                      {pedido.notas && (
                        <p className="sm:col-span-2"><span className="text-[#64748B]">Notas:</span> <span className="text-[#12283F] font-medium">{pedido.notas}</span></p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                        Cambiar estado
                      </label>
                      <select
                        value={pedido.estado}
                        onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                        disabled={cambiandoEstado}
                        className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm bg-white text-[#12283F] font-medium"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </div>

                    <p className="text-xs font-semibold text-[#334155] mb-2">Productos</p>

                    {cargandoDetalle ? (
                      <p className="text-xs text-[#64748B]">Cargando productos...</p>
                    ) : (
                      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                        {itemsPedido.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] last:border-b-0 text-sm"
                          >
                            <div>
                              <p className="font-medium text-[#12283F]">{item.nombre_producto}</p>
                              <p className="text-xs text-[#94A3B8]">
                                {item.cantidad} × {formatearPrecio(item.precio_unitario)}
                              </p>
                            </div>
                            <p className="font-bold text-[#12283F]">
                              {formatearPrecio(item.subtotal)}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#F5F7FA]">
                          <p className="font-bold text-[#12283F] text-sm">Total</p>
                          <p className="font-extrabold text-[#12283F]">
                            {formatearPrecio(pedido.total)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}