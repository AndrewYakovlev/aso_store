import { SignJWT, jwtVerify } from 'jose'
import { config } from '@/env'

export interface JWTPayload {
  userId: string
  role: string
  anonymousId?: string
}

const secret = new TextEncoder().encode(config.jwt.secret)

export async function signJWT(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JWTPayload
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload as JWTPayload
  } catch {
    return null
  }
}