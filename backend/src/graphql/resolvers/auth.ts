import bcrypt from 'bcrypt'
import { GraphQLError } from 'graphql'
import type { Context } from '../context.js'
import { signToken } from '../../middleware/auth.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function requireUser(ctx: Context) {
  if (!ctx.user) {
    throw new GraphQLError('You must be logged in.', { extensions: { code: 'UNAUTHENTICATED' } })
  }
  return ctx.user
}

export const authResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) return null
      return ctx.prisma.user.findUnique({ where: { id: ctx.user.id } })
    },
  },
  Mutation: {
    async signup(
      _: unknown,
      args: { email: string; password: string; displayName?: string | null },
      ctx: Context,
    ) {
      const email = args.email.trim().toLowerCase()
      if (!EMAIL_RE.test(email)) {
        throw new GraphQLError('Enter a valid email address.', { extensions: { code: 'BAD_USER_INPUT' } })
      }
      if (args.password.length < MIN_PASSWORD_LENGTH) {
        throw new GraphQLError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const existing = await ctx.prisma.user.findUnique({ where: { email } })
      if (existing) {
        throw new GraphQLError('An account with that email already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12
      const passwordHash = await bcrypt.hash(args.password, saltRounds)

      const user = await ctx.prisma.user.create({
        data: { email, passwordHash, displayName: args.displayName ?? null },
      })

      const token = signToken({ id: user.id, email: user.email })
      return { token, user }
    },

    async login(_: unknown, args: { email: string; password: string }, ctx: Context) {
      const email = args.email.trim().toLowerCase()
      const user = await ctx.prisma.user.findUnique({ where: { email } })
      const invalidCredsError = new GraphQLError('Invalid email or password.', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
      if (!user) throw invalidCredsError

      const valid = await bcrypt.compare(args.password, user.passwordHash)
      if (!valid) throw invalidCredsError

      const token = signToken({ id: user.id, email: user.email })
      return { token, user }
    },

    updateThemePreference(
      _: unknown,
      args: {
        theme: 'LIGHT' | 'DARK' | 'SEPIA' | 'FOREST' | 'SOLARIZED' | 'NORD' | 'ROSE' | 'HIGH_CONTRAST'
      },
      ctx: Context,
    ) {
      const user = requireUser(ctx)
      return ctx.prisma.user.update({
        where: { id: user.id },
        data: { themePreference: args.theme },
      })
    },

    updateFontPreference(
      _: unknown,
      args: { font: 'SYSTEM' | 'MONTSERRAT' | 'LORA' | 'JETBRAINS_MONO' | 'NUNITO' },
      ctx: Context,
    ) {
      const user = requireUser(ctx)
      return ctx.prisma.user.update({
        where: { id: user.id },
        data: { fontPreference: args.font },
      })
    },
  },
}

export { requireUser }
