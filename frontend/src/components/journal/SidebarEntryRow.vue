<script setup lang="ts">
import type { EntrySummary } from '../../stores/journal'
import { formatEntryDate } from '../../utils/date'

defineProps<{ entry: EntrySummary; active: boolean }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <li
    :data-entry-id="entry.id"
    class="cursor-pointer border-b border-l-2 border-border px-4 py-3"
    :class="active ? 'border-l-primary bg-primary/10' : 'border-l-transparent hover:bg-bg'"
    @click="$emit('select')"
  >
    <p class="truncate text-sm font-medium text-text">{{ entry.title || 'Untitled' }}</p>
    <p class="mt-1 truncate text-xs text-text-muted">{{ entry.contentText }}</p>
    <p class="mt-1 text-xs text-text-muted">{{ formatEntryDate(entry.createdAt, 'short') }}</p>
  </li>
</template>
