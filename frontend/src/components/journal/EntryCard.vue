<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import type { EntrySummary } from '../../stores/journal'
import { formatEntryDate } from '../../utils/date'
import ActionButton from '../ui/ActionButton.vue'

defineProps<{ entry: EntrySummary; confirming: boolean }>()
defineEmits<{ open: []; 'ask-delete': []; 'confirm-delete': []; 'cancel-delete': [] }>()
</script>

<template>
  <div
    class="cursor-pointer rounded-lg border border-border bg-surface p-4 hover:border-primary"
    @click="$emit('open')"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 class="truncate font-medium">{{ entry.title || 'Untitled' }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-text-muted">{{ entry.contentText }}</p>
        <p class="mt-2 text-xs text-text-muted">{{ formatEntryDate(entry.createdAt) }}</p>
      </div>
      <div v-if="confirming" class="flex shrink-0 items-center gap-2 text-xs" @click.stop>
        <span class="text-text-muted">Delete?</span>
        <ActionButton size="sm" tone="danger-emphasis" @click="$emit('confirm-delete')">Confirm</ActionButton>
        <ActionButton size="sm" tone="muted" @click="$emit('cancel-delete')">Cancel</ActionButton>
      </div>
      <ActionButton
        v-else
        size="sm"
        :icon="Trash2"
        tone="danger"
        class="shrink-0"
        @click.stop="$emit('ask-delete')"
      >
        Delete
      </ActionButton>
    </div>
  </div>
</template>
