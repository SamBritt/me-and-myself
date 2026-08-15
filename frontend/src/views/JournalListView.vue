<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJournalStore, type EntrySummary } from '../stores/journal'
import { urqlClient } from '../graphql/client'
import { JournalDocument } from '../graphql/operations/journals'
import ActionButton from '../components/ui/ActionButton.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import EntryCard from '../components/journal/EntryCard.vue'
import EntryCardSkeleton from '../components/journal/EntryCardSkeleton.vue'

const auth = useAuthStore()
const journal = useJournalStore()
const route = useRoute()
const router = useRouter()

const journalId = computed(() => String(route.params.journalId))
const journalName = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
const sentinel = ref<HTMLElement | null>(null)

interface MonthGroup {
  key: string
  label: string
  entries: EntrySummary[]
}

// Entries arrive newest-first (createdAt desc), so consecutive same-month entries are always
// adjacent — grouping is just a single linear pass, no sorting/bucketing needed.
const monthGroups = computed<MonthGroup[]>(() => {
  const groups: MonthGroup[] = []
  for (const entry of journal.entries) {
    const date = new Date(entry.createdAt)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const current = groups[groups.length - 1]
    if (current?.key === key) {
      current.entries.push(entry)
    } else {
      groups.push({
        key,
        label: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        entries: [entry],
      })
    }
  }
  return groups
})

watch(
  journalId,
  (id) => {
    journalName.value = null
    journal.fetchEntries(id)
    urqlClient
      .query(JournalDocument, { id }, { requestPolicy: 'network-only' })
      .toPromise()
      .then((result) => {
        if (!result.data?.journal) {
          router.push('/journals')
          return
        }
        journalName.value = result.data.journal.name
      })
  },
  { immediate: true },
)

// The sentinel element doesn't exist in the DOM until the loading/empty template branches
// resolve to the entry-list branch, so the observer is (re)attached reactively via `watch`
// rather than once in onMounted.
let observer: IntersectionObserver | null = null

watch(sentinel, (el, previousEl) => {
  if (previousEl && observer) observer.unobserve(previousEl)
  if (el) {
    if (!observer) {
      observer = new IntersectionObserver(
        ([intersectionEntry]) => {
          if (intersectionEntry.isIntersecting) journal.fetchMoreEntries(journalId.value)
        },
        { rootMargin: '400px' },
      )
    }
    observer.observe(el)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function onLogout() {
  auth.logout()
  router.push('/login')
}

function onAskDelete(id: string) {
  confirmDeleteId.value = id
}

function onCancelDelete() {
  confirmDeleteId.value = null
}

async function onConfirmDelete(id: string) {
  await journal.deleteEntry(id)
  confirmDeleteId.value = null
}
</script>

<template>
  <main class="min-h-svh bg-bg text-text">
    <header class="flex items-center justify-between border-b border-border px-6 py-4">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-semibold">Me &amp; Myself</h1>
        <RouterLink to="/journals" class="text-sm text-text-muted hover:text-text">Journals</RouterLink>
        <RouterLink to="/insights" class="text-sm text-text-muted hover:text-text">Insights</RouterLink>
        <RouterLink to="/settings" class="text-sm text-text-muted hover:text-text">Settings</RouterLink>
      </div>
      <div class="flex items-center gap-4 text-sm text-text-muted">
        <span v-if="auth.user">{{ auth.user.displayName || auth.user.email }}</span>
        <ActionButton tone="primary" @click="onLogout">Log out</ActionButton>
      </div>
    </header>

    <div class="mx-auto max-w-3xl px-6 py-8">
      <div class="mb-6 flex items-center justify-between">
        <h2 v-if="journalName" class="text-xl font-semibold">{{ journalName }}</h2>
        <Skeleton v-else class="h-7 w-40" />
        <RouterLink
          :to="`/journals/${journalId}/new`"
          class="rounded bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          New entry
        </RouterLink>
      </div>

      <div v-if="journal.loadingEntries" class="flex flex-col gap-2">
        <EntryCardSkeleton v-for="i in 4" :key="i" />
      </div>
      <p v-else-if="journal.entries.length === 0" class="text-text-muted">
        No entries yet. Start writing whenever you're ready.
      </p>

      <!-- Month rail + entries share one grid so each month's rail segment stretches (default
           align-items: stretch) to the exact height of that month's entry stack, keeping the
           line continuous instead of two independently-sized columns drifting apart. The line
           itself is a `border-right`, not an absolutely-positioned width-1px div — the latter
           lands on a fractional device-pixel offset here and anti-aliases into near invisibility;
           `border` is special-cased by browsers to always snap to a crisp physical pixel. -->
      <template v-else>
        <div class="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2">
          <template v-for="group in monthGroups" :key="group.key">
            <div class="border-r border-border pr-4">
              <span class="block text-right text-xs font-medium text-text-muted">{{ group.label }}</span>
            </div>

            <TransitionGroup name="list" tag="ul" class="relative flex flex-col gap-2">
              <li v-for="entry in group.entries" :key="entry.id">
                <EntryCard
                  :entry="entry"
                  :confirming="confirmDeleteId === entry.id"
                  @open="router.push(`/journals/${journalId}/${entry.id}`)"
                  @ask-delete="onAskDelete(entry.id)"
                  @confirm-delete="onConfirmDelete(entry.id)"
                  @cancel-delete="onCancelDelete()"
                />
              </li>
            </TransitionGroup>
          </template>
        </div>

        <!-- Pre-fetch lead time (rootMargin: 400px) means the next page starts loading before the
             sentinel is actually scrolled into view, so it's ready by the time the user reaches it. -->
        <div v-if="journal.hasMoreEntries" ref="sentinel" class="mt-2 flex flex-col gap-2">
          <template v-if="journal.loadingMore">
            <EntryCardSkeleton v-for="i in 2" :key="i" />
          </template>
        </div>
      </template>
    </div>
  </main>
</template>
