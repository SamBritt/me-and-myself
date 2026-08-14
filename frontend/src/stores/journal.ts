import { ref } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient } from '../graphql/client'
import {
  JournalEntriesDocument,
  JournalEntryDocument,
  CreateJournalEntryDocument,
  UpdateJournalEntryDocument,
  DeleteJournalEntryDocument,
} from '../graphql/operations/journal'

const AUTOSAVE_DELAY_MS = 1200

export interface EntrySummary {
  id: string
  title?: string | null
  contentText: string
  moodRating?: number | null
  createdAt: string
  updatedAt: string
}

interface Draft {
  id: string | null
  journalId: string | null
  title: string
  contentJson: object | null
  contentText: string
  moodRating: number | null
  createdAt: string | null
}

function emptyDraft(journalId: string | null = null): Draft {
  return {
    id: null,
    journalId,
    title: '',
    contentJson: null,
    contentText: '',
    moodRating: null,
    createdAt: null,
  }
}

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<EntrySummary[]>([])
  const loadingEntries = ref(false)

  const draft = ref<Draft>(emptyDraft())
  const dirty = ref(false)
  const saving = ref(false)
  const loadingDraft = ref(false)

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchEntries(journalId: string) {
    loadingEntries.value = true
    try {
      const result = await urqlClient
        .query(
          JournalEntriesDocument,
          { journalId, limit: 50, offset: 0 },
          { requestPolicy: 'network-only' },
        )
        .toPromise()
      entries.value = result.data?.journalEntries ?? []
    } finally {
      loadingEntries.value = false
    }
  }

  function startNewDraft(journalId: string) {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    draft.value = emptyDraft(journalId)
    dirty.value = false
  }

  async function loadDraft(id: string) {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    loadingDraft.value = true
    try {
      const result = await urqlClient
        .query(JournalEntryDocument, { id }, { requestPolicy: 'network-only' })
        .toPromise()
      const entry = result.data?.journalEntry
      if (!entry) {
        draft.value = emptyDraft()
        return
      }
      draft.value = {
        id: entry.id,
        journalId: null,
        title: entry.title ?? '',
        contentJson: entry.contentJson as object,
        contentText: entry.contentText,
        moodRating: entry.moodRating ?? null,
        createdAt: entry.createdAt,
      }
      dirty.value = false
    } finally {
      loadingDraft.value = false
    }
  }

  function scheduleAutosave() {
    dirty.value = true
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      void saveDraft()
    }, AUTOSAVE_DELAY_MS)
  }

  function updateDraftContent(payload: { contentJson: object; contentText: string }) {
    draft.value.contentJson = payload.contentJson
    draft.value.contentText = payload.contentText
    scheduleAutosave()
  }

  function updateDraftTitle(title: string) {
    draft.value.title = title
    scheduleAutosave()
  }

  function updateDraftMood(rating: number | null) {
    draft.value.moodRating = rating
    scheduleAutosave()
  }

  async function saveDraft() {
    if (!dirty.value || !draft.value.contentJson) return
    saving.value = true
    try {
      if (draft.value.id) {
        const result = await urqlClient
          .mutation(UpdateJournalEntryDocument, {
            id: draft.value.id,
            title: draft.value.title || null,
            contentJson: draft.value.contentJson,
            contentText: draft.value.contentText,
            moodRating: draft.value.moodRating,
          })
          .toPromise()
        if (result.error) throw new Error(result.error.message)
        const updated = result.data?.updateJournalEntry
        if (updated) {
          const index = entries.value.findIndex((e) => e.id === updated.id)
          if (index !== -1) entries.value[index] = updated
        }
      } else {
        if (!draft.value.journalId) return
        const result = await urqlClient
          .mutation(CreateJournalEntryDocument, {
            journalId: draft.value.journalId,
            title: draft.value.title || null,
            contentJson: draft.value.contentJson,
            contentText: draft.value.contentText,
            moodRating: draft.value.moodRating,
          })
          .toPromise()
        if (result.error) throw new Error(result.error.message)
        const created = result.data?.createJournalEntry
        if (created) {
          draft.value.id = created.id
          draft.value.createdAt = created.createdAt
          entries.value.unshift(created)
        }
      }
      dirty.value = false
    } finally {
      saving.value = false
    }
  }

  async function deleteEntry(id: string) {
    const result = await urqlClient.mutation(DeleteJournalEntryDocument, { id }).toPromise()
    if (result.error) throw new Error(result.error.message)
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  return {
    entries,
    loadingEntries,
    draft,
    dirty,
    saving,
    loadingDraft,
    fetchEntries,
    startNewDraft,
    loadDraft,
    updateDraftContent,
    updateDraftTitle,
    updateDraftMood,
    saveDraft,
    deleteEntry,
  }
})
