import type { Context } from '../context.js'
import { requireUser } from './auth.js'

// Buckets by the server's local calendar day rather than UTC. This app is single-user and
// runs where its user is, so local-day boundaries match the user's actual day far better than
// UTC would (UTC truncation mis-attributes evening entries to the next day for the US and most
// timezones west of it).
export function dayOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

/** Keeps the canonical daily MoodLog in sync with a journal entry's own moodRating field. */
export async function syncMoodLogForEntry(
  ctx: Context,
  entry: { id: string; userId: string; createdAt: Date; moodRating: number | null },
) {
  if (entry.moodRating === null) {
    await ctx.prisma.moodLog.deleteMany({ where: { entryId: entry.id } })
    return
  }

  const date = dayOnly(entry.createdAt)

  // If this entry's own MoodLog somehow points at a different date (day-bucketing edge cases,
  // e.g. writing right at a local midnight boundary), unlink it first — entryId is unique, so
  // leaving it attached would collide with the upsert below once it targets the new date.
  await ctx.prisma.moodLog.updateMany({
    where: { entryId: entry.id, date: { not: date } },
    data: { entryId: null },
  })

  await ctx.prisma.moodLog.upsert({
    where: { userId_date: { userId: entry.userId, date } },
    update: { rating: entry.moodRating, entryId: entry.id },
    create: { userId: entry.userId, date, rating: entry.moodRating, entryId: entry.id },
  })
}

export const moodResolvers = {
  Query: {
    moodLogs(_: unknown, args: { from?: string | null; to?: string | null }, ctx: Context) {
      const user = requireUser(ctx)
      return ctx.prisma.moodLog.findMany({
        where: {
          userId: user.id,
          ...(args.from || args.to
            ? {
                date: {
                  ...(args.from && { gte: dayOnly(new Date(args.from)) }),
                  ...(args.to && { lte: dayOnly(new Date(args.to)) }),
                },
              }
            : {}),
        },
        orderBy: { date: 'asc' },
      })
    },
  },
  Mutation: {
    upsertMoodLog(
      _: unknown,
      args: { date: string; rating: number; note?: string | null },
      ctx: Context,
    ) {
      const user = requireUser(ctx)
      const date = dayOnly(new Date(args.date))
      return ctx.prisma.moodLog.upsert({
        where: { userId_date: { userId: user.id, date } },
        update: { rating: args.rating, note: args.note ?? null },
        create: { userId: user.id, date, rating: args.rating, note: args.note ?? null },
      })
    },
  },
}
