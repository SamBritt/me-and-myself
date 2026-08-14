import { GraphQLError } from 'graphql'
import type { Context } from '../context.js'
import { requireUser } from './auth.js'

export async function loadOwnedJournal(ctx: Context, id: string) {
  const user = requireUser(ctx)
  const journal = await ctx.prisma.journal.findUnique({ where: { id } })
  if (!journal || journal.userId !== user.id) {
    throw new GraphQLError('Journal not found.', { extensions: { code: 'NOT_FOUND' } })
  }
  return journal
}

export const journalsResolvers = {
  Query: {
    journals(_: unknown, __: unknown, ctx: Context) {
      const user = requireUser(ctx)
      return ctx.prisma.journal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      })
    },
    journal(_: unknown, args: { id: string }, ctx: Context) {
      return loadOwnedJournal(ctx, args.id)
    },
  },
  Mutation: {
    createJournal(_: unknown, args: { name: string }, ctx: Context) {
      const user = requireUser(ctx)
      const name = args.name.trim()
      if (!name) {
        throw new GraphQLError('Journal name cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } })
      }
      return ctx.prisma.journal.create({ data: { userId: user.id, name } })
    },

    async deleteJournal(_: unknown, args: { id: string }, ctx: Context) {
      await loadOwnedJournal(ctx, args.id)
      await ctx.prisma.journal.delete({ where: { id: args.id } })
      return true
    },
  },
  Journal: {
    entryCount(parent: { id: string }, _: unknown, ctx: Context) {
      return ctx.prisma.journalEntry.count({ where: { journalId: parent.id } })
    },
  },
}
