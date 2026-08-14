import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient } from '../graphql/client'
import { MoodLogsDocument } from '../graphql/operations/mood'

interface MoodLogEntry {
  id: string
  date: string
  rating: number
  note?: string | null
}

// MoodLog dates arrive as UTC-midnight-of-the-user's-local-day (the backend's day-bucketing
// scheme, see backend/src/graphql/resolvers/mood.ts), so slicing the ISO string is safe here —
// no further timezone conversion involved.
function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

// For "today" as computed client-side, we must NOT go through toISOString() — that converts to
// UTC and can land on the wrong calendar day in the evening. Build the key from local components
// instead, matching the backend's local-day semantics.
function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const useMoodStore = defineStore('mood', () => {
  const moodLogs = ref<MoodLogEntry[]>([])
  const loading = ref(false)

  async function fetchMoodLogs(from?: Date, to?: Date) {
    loading.value = true
    try {
      const result = await urqlClient
        .query(
          MoodLogsDocument,
          { from: from?.toISOString(), to: to?.toISOString() },
          { requestPolicy: 'network-only' },
        )
        .toPromise()
      moodLogs.value = result.data?.moodLogs ?? []
    } finally {
      loading.value = false
    }
  }

  const sortedLogs = computed(() =>
    [...moodLogs.value].sort((a, b) => a.date.localeCompare(b.date)),
  )

  /** 7-day trailing average aligned to each logged day, using whatever days are actually logged in that window. */
  const rollingAverageSeries = computed(() => {
    const logs = sortedLogs.value
    return logs.map((log, i) => {
      const windowStart = new Date(log.date)
      windowStart.setUTCDate(windowStart.getUTCDate() - 6)
      const windowLogs = logs
        .slice(0, i + 1)
        .filter((l) => new Date(l.date) >= windowStart)
      const avg = windowLogs.reduce((sum, l) => sum + l.rating, 0) / windowLogs.length
      return { date: log.date, average: Math.round(avg * 10) / 10 }
    })
  })

  function averageOverLastDays(days: number): number | null {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (days - 1))
    const cutoffKey = localDateKey(cutoff)
    const inWindow = sortedLogs.value.filter((l) => toDateKey(l.date) >= cutoffKey)
    if (inWindow.length === 0) return null
    return Math.round((inWindow.reduce((sum, l) => sum + l.rating, 0) / inWindow.length) * 10) / 10
  }

  const currentStreak = computed(() => {
    const logged = new Set(moodLogs.value.map((l) => toDateKey(l.date)))
    let streak = 0
    const cursor = new Date()
    while (logged.has(localDateKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  })

  return {
    moodLogs,
    loading,
    fetchMoodLogs,
    sortedLogs,
    rollingAverageSeries,
    averageOverLastDays,
    currentStreak,
  }
})
