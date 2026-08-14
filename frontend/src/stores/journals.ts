import { ref } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient } from '../graphql/client'
import { JournalsDocument, CreateJournalDocument, DeleteJournalDocument } from '../graphql/operations/journals'

export interface JournalSummary {
  id: string
  name: string
  entryCount: number
  createdAt: string
}

export const useJournalsStore = defineStore('journals', () => {
  const journals = ref<JournalSummary[]>([])
  const loading = ref(false)

  async function fetchJournals() {
    loading.value = true
    try {
      const result = await urqlClient
        .query(JournalsDocument, {}, { requestPolicy: 'network-only' })
        .toPromise()
      journals.value = result.data?.journals ?? []
    } finally {
      loading.value = false
    }
  }

  async function createJournal(name: string) {
    const result = await urqlClient.mutation(CreateJournalDocument, { name }).toPromise()
    if (result.error) throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message)
    const created = result.data?.createJournal
    if (created) journals.value.push(created)
    return created
  }

  async function deleteJournal(id: string) {
    const result = await urqlClient.mutation(DeleteJournalDocument, { id }).toPromise()
    if (result.error) throw new Error(result.error.message)
    journals.value = journals.value.filter((j) => j.id !== id)
  }

  return { journals, loading, fetchJournals, createJournal, deleteJournal }
})
