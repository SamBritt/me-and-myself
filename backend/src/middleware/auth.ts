import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: string
  email: string
}

export function verifyToken(authHeader: string | undefined | null): AuthUser | null {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; email: string }
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '30d') as jwt.SignOptions['expiresIn'],
  })
}
