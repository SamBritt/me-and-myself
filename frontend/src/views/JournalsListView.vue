<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@lucide/vue'
import { useAuthStore } from '../stores/auth'
import { useJournalsStore } from '../stores/journals'
import ActionButton from '../components/ui/ActionButton.vue'
import JournalCard from '../components/journal/JournalCard.vue'
import JournalCardSkeleton from '../components/journal/JournalCardSkeleton.vue'

const auth = useAuthStore()
const journals = useJournalsStore()
const router = useRouter()

const confirmDeleteId = ref<string | null>(null)
const newJournalName = ref('')
const creating = ref(false)
const submitting = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  journals.fetchJournals()
})

function onLogout() {
  auth.logout()
  router.push('/login')
}

function startCreate() {
  creating.value = true
  nextTick(() => inputRef.value?.focus())
}

function cancelCreate() {
  creating.value = false
  newJournalName.value = ''
}

async function onCreate() {
  const name = newJournalName.value.trim()
  if (!name) {
    cancelCreate()
    return
  }
  submitting.value = true
  try {
    await journals.createJournal(name)
    creating.value = false
    newJournalName.value = ''
  } finally {
    submitting.value = false
  }
}

function onOpen(id: string) {
  router.push(`/journals/${id}`)
}

function onAskDelete(id: string) {
  confirmDeleteId.value = id
}

function onCancelDelete() {
  confirmDeleteId.value = null
}

async function onConfirmDelete(id: string) {
  await journals.deleteJournal(id)
  confirmDeleteId.value = null
}
</script>

<template>
  <main class="min-h-svh bg-bg text-text">
    <header class="flex items-center justify-between border-b border-border px-6 py-4">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-semibold">Me &amp; Myself</h1>
        <span class="text-sm font-medium text-primary">Journals</span>
        <RouterLink to="/insights" class="text-sm text-text-muted hover:text-text">Insights</RouterLink>
        <RouterLink to="/settings" class="text-sm text-text-muted hover:text-text">Settings</RouterLink>
      </div>
      <div class="flex items-center gap-4 text-sm text-text-muted">
        <span v-if="auth.user">{{ auth.user.displayName || auth.user.email }}</span>
        <ActionButton tone="primary" @click="onLogout">Log out</ActionButton>
      </div>
    </header>

    <div class="mx-auto max-w-4xl px-6 py-8">
      <h2 class="mb-4 text-xl font-semibold">Your journals</h2>

      <div v-if="journals.loading" class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        <JournalCardSkeleton v-for="i in 4" :key="i" />
      </div>

      <div v-else class="relative grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        <button
          v-if="!creating"
          type="button"
          class="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-text-muted hover:border-primary hover:text-primary"
          @click="startCreate"
        >
          <Plus :size="28" />
          <span class="text-sm font-medium">New journal</span>
        </button>
        <form
          v-else
          class="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary p-4"
          @submit.prevent="onCreate"
        >
          <input
            ref="inputRef"
            v-model="newJournalName"
            type="text"
            placeholder="Journal name"
            :disabled="submitting"
            class="w-full rounded border border-border bg-surface px-3 py-2 text-center text-sm text-text outline-none focus:border-primary disabled:opacity-50"
            @keydown.esc="cancelCreate"
            @blur="cancelCreate"
          />
        </form>

        <TransitionGroup tag="div" class="contents" name="grid-list">
          <JournalCard
            v-for="journal in journals.journals"
            :key="journal.id"
            :journal="journal"
            :confirming="confirmDeleteId === journal.id"
            @open="onOpen(journal.id)"
            @ask-delete="onAskDelete(journal.id)"
            @confirm-delete="onConfirmDelete(journal.id)"
            @cancel-delete="onCancelDelete()"
          />
        </TransitionGroup>
      </div>
    </div>
  </main>
</template>
