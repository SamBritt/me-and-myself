<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMoodStore } from '../stores/mood'
import MoodTrendChart from '../components/mood/MoodTrendChart.vue'
import ActionButton from '../components/ui/ActionButton.vue'

const auth = useAuthStore()
const mood = useMoodStore()
const router = useRouter()

onMounted(() => {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  mood.fetchMoodLogs(from, to)
})

const streak = computed(() => mood.currentStreak)
const avg7 = computed(() => mood.averageOverLastDays(7))
const avg30 = computed(() => mood.averageOverLastDays(30))

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <main class="min-h-svh bg-bg text-text">
    <header class="flex items-center justify-between border-b border-border px-6 py-4">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-semibold">Me &amp; Myself</h1>
        <RouterLink to="/journals" class="text-sm text-text-muted hover:text-text">Journals</RouterLink>
        <span class="text-sm font-medium text-primary">Insights</span>
        <RouterLink to="/settings" class="text-sm text-text-muted hover:text-text">Settings</RouterLink>
      </div>
      <div class="flex items-center gap-4 text-sm text-text-muted">
        <span v-if="auth.user">{{ auth.user.displayName || auth.user.email }}</span>
        <ActionButton tone="primary" @click="onLogout">Log out</ActionButton>
      </div>
    </header>

    <div class="mx-auto max-w-3xl px-6 py-8">
      <h2 class="mb-6 text-xl font-semibold">Mood insights</h2>

      <div class="mb-6 grid grid-cols-3 gap-4">
        <div class="rounded-lg border border-border bg-surface p-4 text-center">
          <p class="text-2xl font-semibold text-text">{{ streak }}</p>
          <p class="mt-1 text-xs text-text-muted">day streak</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 text-center">
          <p class="text-2xl font-semibold text-text">{{ avg7 ?? '–' }}</p>
          <p class="mt-1 text-xs text-text-muted">7-day average</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 text-center">
          <p class="text-2xl font-semibold text-text">{{ avg30 ?? '–' }}</p>
          <p class="mt-1 text-xs text-text-muted">30-day average</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-surface p-4">
        <p v-if="mood.loading" class="text-text-muted">Loading…</p>
        <p v-else-if="mood.sortedLogs.length === 0" class="text-text-muted">
          No mood data yet. Rate your day from a journal entry to start seeing trends here.
        </p>
        <MoodTrendChart v-else />
      </div>
    </div>
  </main>
</template>
