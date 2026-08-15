<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, X } from '@lucide/vue'
import { useJournalStore } from '../../stores/journal'
import IconButton from '../ui/IconButton.vue'
import SidebarEntryRow from './SidebarEntryRow.vue'
import SidebarEntryRowSkeleton from './SidebarEntryRowSkeleton.vue'

const props = defineProps<{ journalId: string; journalName: string | null; activeId: string | null }>()
const emit = defineEmits<{ close: [] }>()

const journal = useJournalStore()
const router = useRouter()
const sentinel = ref<HTMLElement | null>(null)
const listContainer = ref<HTMLElement | null>(null)

watch(
  () => props.journalId,
  async (id) => {
    await journal.fetchEntries(id)
    await revealActiveEntry()
  },
  { immediate: true },
)

// Refresh (or any deep link) lands here with only the first page loaded, so the entry the user
// actually came to view may be several pages further down. Keep paging until it shows up — for a
// journal-sized entry count this is a handful of fast round trips, not worth a dedicated backend
// "anchor" query. Skip entirely if the entry's already in the first page: it's already on-screen
// (or at least reachable without a fetch), so scrolling here would just yank focus away from a
// normal in-list click.
async function revealActiveEntry() {
  const id = props.activeId
  if (!id || journal.entries.some((e) => e.id === id)) return
  while (!journal.entries.some((e) => e.id === id) && journal.hasMoreEntries) {
    await journal.fetchMoreEntries(props.journalId)
  }
  if (!journal.entries.some((e) => e.id === id)) return
  await nextTick()
  listContainer.value?.querySelector(`[data-entry-id="${id}"]`)?.scrollIntoView({ block: 'center' })
}

// Same sentinel pattern as JournalListView.vue: the sentinel only exists once the loading/empty
// branches resolve to the entry-list branch, so the observer is (re)attached reactively.
let observer: IntersectionObserver | null = null

watch(sentinel, (el, previousEl) => {
  if (previousEl && observer) observer.unobserve(previousEl)
  if (el) {
    if (!observer) {
      observer = new IntersectionObserver(
        ([intersectionEntry]) => {
          if (intersectionEntry.isIntersecting) journal.fetchMoreEntries(props.journalId)
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

function onSelect(id: string) {
  router.push(`/journals/${props.journalId}/${id}`)
}

function onNewEntry() {
  router.push(`/journals/${props.journalId}/new`)
}
</script>

<template>
  <aside class="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface">
    <div class="flex items-center justify-between border-b border-border px-4 py-4">
      <h2 class="truncate text-sm font-semibold text-text">{{ journalName ?? 'Entries' }}</h2>
      <div class="flex shrink-0 items-center gap-3">
        <IconButton :icon="Plus" label="New entry" @click="onNewEntry" />
        <IconButton :icon="X" label="Hide list" @click="emit('close')" />
      </div>
    </div>

    <div ref="listContainer" class="flex-1 overflow-y-auto">
      <ul v-if="journal.loadingEntries" class="relative">
        <SidebarEntryRowSkeleton v-for="i in 5" :key="i" />
      </ul>
      <p v-else-if="journal.entries.length === 0" class="px-4 py-4 text-sm text-text-muted">
        No entries yet.
      </p>
      <template v-else>
        <TransitionGroup name="list" tag="ul" class="relative">
          <SidebarEntryRow
            v-for="entry in journal.entries"
            :key="entry.id"
            :entry="entry"
            :active="entry.id === props.activeId"
            @select="onSelect(entry.id)"
          />
        </TransitionGroup>

        <ul v-if="journal.hasMoreEntries" ref="sentinel">
          <SidebarEntryRowSkeleton v-if="journal.loadingMore" />
        </ul>
      </template>
    </div>
  </aside>
</template>
