<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJournalStore } from '../stores/journal'
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

    <div class="mx-auto max-w-2xl px-6 py-8">
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

      <TransitionGroup v-else name="list" tag="ul" class="relative flex flex-col gap-2">
        <li v-for="entry in journal.entries" :key="entry.id">
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
    </div>
  </main>
</template>
