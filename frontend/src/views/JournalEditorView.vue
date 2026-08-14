<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PanelLeft, Pencil, Trash2 } from '@lucide/vue'
import { useJournalStore } from '../stores/journal'
import { urqlClient } from '../graphql/client'
import { JournalDocument } from '../graphql/operations/journals'
import { formatEntryDate } from '../utils/date'
import JournalEditor from '../components/editor/JournalEditor.vue'
import MoodSlider from '../components/mood/MoodSlider.vue'
import EntryListSidebar from '../components/journal/EntryListSidebar.vue'
import EntryEditorSkeleton from '../components/journal/EntryEditorSkeleton.vue'
import IconButton from '../components/ui/IconButton.vue'
import ActionButton from '../components/ui/ActionButton.vue'

const route = useRoute()
const router = useRouter()
const journal = useJournalStore()

const journalId = computed(() => String(route.params.journalId))
const entryId = computed(() => (route.params.entryId === undefined ? null : String(route.params.entryId)))
const journalName = ref<string | null>(null)
const mode = ref<'read' | 'edit'>('edit')
const sidebarOpen = ref(true)
const confirmingDelete = ref(false)

// True for exactly one entryId change: the one caused by the replace() below, right after a
// brand-new entry's first autosave assigns it a real id. Without this, that route change would
// be indistinguishable from the user navigating to an existing entry, and the watcher below would
// reload the draft and flip out of edit mode mid-keystroke.
const urlSyncPending = ref(false)

watch(
  journalId,
  async (id) => {
    journalName.value = null
    const result = await urqlClient
      .query(JournalDocument, { id }, { requestPolicy: 'network-only' })
      .toPromise()
    if (!result.data?.journal) {
      router.push('/journals')
      return
    }
    journalName.value = result.data.journal.name
  },
  { immediate: true },
)

watch(
  () => journal.draft.id,
  (id) => {
    if (id && !entryId.value) {
      urlSyncPending.value = true
      router.replace(`/journals/${journalId.value}/${id}`)
    }
  },
)

watch(
  entryId,
  (id, previousId) => {
    if (urlSyncPending.value) {
      urlSyncPending.value = false
      return
    }
    if (previousId !== undefined && journal.dirty) journal.saveDraft()
    confirmingDelete.value = false
    if (id) {
      journal.loadDraft(id)
      mode.value = 'read'
    } else {
      journal.startNewDraft(journalId.value)
      mode.value = 'edit'
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (journal.dirty) journal.saveDraft()
})

async function onConfirmDelete() {
  if (!journal.draft.id) return
  await journal.deleteEntry(journal.draft.id)
  router.push(`/journals/${journalId.value}`)
}

function onBack() {
  router.push(`/journals/${journalId.value}`)
}

function onEdit() {
  mode.value = 'edit'
}

async function onDone() {
  if (journal.dirty) await journal.saveDraft()
  mode.value = 'read'
}
</script>

<template>
  <div class="flex h-svh overflow-hidden bg-bg text-text">
    <Transition name="sidebar">
      <EntryListSidebar
        v-show="sidebarOpen"
        :journal-id="journalId"
        :journal-name="journalName"
        :active-id="entryId"
        @close="sidebarOpen = false"
      />
    </Transition>

    <main class="min-w-0 flex-1 overflow-y-auto">
      <header class="flex items-center justify-between border-b border-border px-6 py-4">
        <div class="flex items-center gap-3">
          <IconButton v-if="!sidebarOpen" :icon="PanelLeft" label="Show list" @click="sidebarOpen = true" />
          <ActionButton tone="muted" @click="onBack">&larr; Back</ActionButton>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3 text-sm text-text-muted">
          <template v-if="confirmingDelete">
            <span>Delete?</span>
            <ActionButton tone="danger-emphasis" @click="onConfirmDelete">Confirm</ActionButton>
            <ActionButton tone="muted" @click="confirmingDelete = false">Cancel</ActionButton>
          </template>
          <template v-else>
            <template v-if="mode === 'edit'">
              <span v-if="journal.saving">Saving…</span>
              <span v-else-if="journal.dirty">Unsaved changes</span>
              <span v-else-if="journal.draft.id">Saved</span>
              <ActionButton v-if="entryId" tone="muted" @click="onDone">Done</ActionButton>
            </template>
            <ActionButton v-else :icon="Pencil" tone="muted" @click="onEdit">Edit</ActionButton>
            <ActionButton
              v-if="journal.draft.id"
              :icon="Trash2"
              tone="danger"
              @click="confirmingDelete = true"
            >
              Delete
            </ActionButton>
          </template>
        </div>
      </header>

      <div class="mx-auto max-w-2xl px-6 py-8">
        <template v-if="!journal.loadingDraft">
          <template v-if="mode === 'edit'">
            <input
              :value="journal.draft.title"
              type="text"
              placeholder="Title (optional)"
              class="mb-4 w-full border-none bg-transparent text-2xl font-semibold text-text outline-none placeholder:text-text-muted"
              @input="journal.updateDraftTitle(($event.target as HTMLInputElement).value)"
            />
            <MoodSlider
              :model-value="journal.draft.moodRating"
              class="mb-4"
              @update:model-value="journal.updateDraftMood"
            />
          </template>
          <template v-else>
            <h1 class="mb-2 text-2xl font-semibold text-text">
              {{ journal.draft.title || 'Untitled' }}
            </h1>
            <p v-if="journal.draft.createdAt" class="mb-1 text-sm text-text-muted">
              {{ formatEntryDate(journal.draft.createdAt, 'full') }}
            </p>
            <p v-if="journal.draft.moodRating !== null" class="mb-4 text-sm text-text-muted">
              Mood: {{ journal.draft.moodRating }}/10
            </p>
          </template>

          <JournalEditor
            :key="mode"
            :model-value="journal.draft.contentJson"
            :editable="mode === 'edit'"
            @update:content="journal.updateDraftContent"
          />
        </template>
        <EntryEditorSkeleton v-else />
      </div>
    </main>
  </div>
</template>
