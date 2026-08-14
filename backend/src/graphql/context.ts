import type { YogaInitialContext } from 'graphql-yoga'
import { prisma } from '../lib/prisma.js'
import { verifyToken, type AuthUser } from '../middleware/auth.js'

export interface Context extends YogaInitialContext {
  prisma: typeof prisma
  user: AuthUser | null
}

export function createContext({ request }: YogaInitialContext): Context {
  const user = verifyToken(request.headers.get('authorization'))
  return { request, prisma, user } as Context
}
