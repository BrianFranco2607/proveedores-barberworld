'use client'

import { createContext, useContext, useMemo, useState } from 'react'

export type ProductoCarrito = {
  id: string
  nombre: string
  precio: number
  imagen_url: string | null
  cantidad: number
}

type CartContextType = {
  items: ProductoCarrito[]
  cantidadTotal: number
  total: number
  agregarProducto: (producto: Omit<ProductoCarrito, 'cantidad'>) => void
  aumentarCantidad: (id: string) => void
  disminuirCantidad: (id: string) => void
  eliminarProducto: (id: string) => void
  vaciarCarrito: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductoCarrito[]>([])

  function agregarProducto(producto: Omit<ProductoCarrito, 'cantidad'>) {
    setItems((actuales) => {
      const existente = actuales.find((item) => item.id === producto.id)

      if (existente) {
        return actuales.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }

      return [...actuales, { ...producto, cantidad: 1 }]
    })
  }

  function aumentarCantidad(id: string) {
    setItems((actuales) =>
      actuales.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    )
  }

  function disminuirCantidad(id: string) {
    setItems((actuales) =>
      actuales
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  function eliminarProducto(id: string) {
    setItems((actuales) => actuales.filter((item) => item.id !== id))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const cantidadTotal = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items]
  )

  const total = useMemo(
    () => items.reduce((total, item) => total + item.precio * item.cantidad, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        cantidadTotal,
        total,
        agregarProducto,
        aumentarCantidad,
        disminuirCantidad,
        eliminarProducto,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider')
  }

  return context
}