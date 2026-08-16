import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from './components/CartContext'
import CarritoFlotante from './components/CarritoFlotante'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Barberworld — Catálogo Proveedores',
  description: 'Catálogo de productos para proveedores de Barberworld',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`${bebasNeue.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <CartProvider>
          {children}
          <CarritoFlotante />
        </CartProvider>
      </body>
    </html>
  )
}