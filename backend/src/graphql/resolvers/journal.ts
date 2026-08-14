import { GraphQLError } from 'graphql'
import type { Context } from '../context.js'
import { requireUser } from './auth.js'
import { syncMoodLogForEntry } from './mood.js'
import { loadOwnedJournal } from './journals.js'

async function loadOwnedEntry(ctx: Context, id: string) {
  const user = requireUser(ctx)
  const entry = await ctx.prisma.journalEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== user.id) {
    throw new GraphQLError('Journal entry not found.', { extensions: { code: 'NOT_FOUND' } })
  }
  return entry
}

export const journalResolvers = {
  Query: {
    journalEntries(
      _: unknown,
      args: { journalId: string; limit?: number | null; offset?: number | null },
      ctx: Context,
    ) {
      const user = requireUser(ctx)
      return ctx.prisma.journalEntry.findMany({
        where: { userId: user.id, journalId: args.journalId },
        orderBy: { createdAt: 'desc' },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
      })
    },
    journalEntry(_: unknown, args: { id: string }, ctx: Context) {
      return loadOwnedEntry(ctx, args.id)
    },
  },
  Mutation: {
    async createJournalEntry(
      _: unknown,
      args: {
        journalId: string
        title?: string | null
        contentJson: unknown
        contentText: string
        moodRating?: number | null
      },
      ctx: Context,
    ) {
      const user = requireUser(ctx)
      await loadOwnedJournal(ctx, args.journalId)
      const entry = await ctx.prisma.journalEntry.create({
        data: {
          userId: user.id,
          journalId: args.journalId,
          title: args.title ?? null,
          contentJson: args.contentJson as any,
          contentText: args.contentText,
          moodRating: args.moodRating ?? null,
        },
      })
      await syncMoodLogForEntry(ctx, entry)
      return entry
    },

    async updateJournalEntry(
      _: unknown,
      args: {
        id: string
        title?: string | null
        contentJson?: unknown
        contentText?: string | null
        moodRating?: number | null
      },
      ctx: Context,
    ) {
      await loadOwnedEntry(ctx, args.id)
      const entry = await ctx.prisma.journalEntry.update({
        where: { id: args.id },
        data: {
          ...(args.title !== undefined && { title: args.title }),
          ...(args.contentJson !== undefined && { contentJson: args.contentJson as any }),
          ...(args.contentText !== undefined && { contentText: args.contentText! }),
          ...(args.moodRating !== undefined && { moodRating: args.moodRating }),
        },
      })
      if (args.moodRating !== undefined) await syncMoodLogForEntry(ctx, entry)
      return entry
    },

    async deleteJournalEntry(_: unknown, args: { id: string }, ctx: Context) {
      await loadOwnedEntry(ctx, args.id)
      await ctx.prisma.journalEntry.delete({ where: { id: args.id } })
      return true
    },
  },
}
