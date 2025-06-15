export interface User {
  id: string
  phone: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  customerGroup?: {
    id: string
    name: string
    discountPercent: string | number
  } | null
  _count: {
    orders: number
    carts: number
    favorites: number
    chats: number
  }
  orders: Array<{
    id: string
    orderNumber: string
    createdAt: string
    totalAmount: string | number
    status: {
      id: string
      name: string
      color?: string
    }
    items: Array<{
      id: string
      quantity: number
      price: string | number
      product?: {
        id: string
        name: string
        sku: string
      } | null
    }>
  }>
  carts: Array<{
    id: string
    items: Array<{
      id: string
      quantity: number
      price: string | number
      product?: {
        id: string
        name: string
        sku: string
      } | null
    }>
  }>
  favorites: Array<{
    id: string
    createdAt: string
    product: {
      id: string
      name: string
      sku: string
      price: string | number
    }
  }>
  anonymousSessions: Array<{
    id: string
    token: string
    sessionId: string
    createdAt: string
    lastActivity: string
  }>
}