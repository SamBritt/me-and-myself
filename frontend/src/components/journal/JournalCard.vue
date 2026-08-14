<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import type { JournalSummary } from '../../stores/journals'
import { formatEntryDate } from '../../utils/date'
import ActionButton from '../ui/ActionButton.vue'

defineProps<{ journal: JournalSummary; confirming: boolean }>()
defineEmits<{ open: []; 'ask-delete': []; 'confirm-delete': []; 'cancel-delete': [] }>()
</script>

<template>
  <div
    class="flex min-h-[140px] cursor-pointer flex-col justify-between rounded-lg border border-border bg-surface p-4 hover:border-primary"
    @click="$emit('open')"
  >
    <div class="min-w-0">
      <h3 class="truncate font-medium">{{ journal.name }}</h3>
      <p class="mt-1 text-sm text-text-muted">
        {{ journal.entryCount }} {{ journal.entryCount === 1 ? 'entry' : 'entries' }}
      </p>
    </div>

    <div v-if="confirming" class="mt-2 flex flex-wrap items-center gap-2" @click.stop>
      <span class="text-xs text-text-muted">
        {{
          journal.entryCount > 0
            ? `Delete journal and ${journal.entryCount} ${journal.entryCount === 1 ? 'entry' : 'entries'}?`
            : 'Delete journal?'
        }}
      </span>
      <div class="flex gap-2">
        <ActionButton size="sm" tone="danger-emphasis" @click="$emit('confirm-delete')">Confirm</ActionButton>
        <ActionButton size="sm" tone="muted" @click="$emit('cancel-delete')">Cancel</ActionButton>
      </div>
    </div>
    <div v-else class="mt-2 flex items-center justify-between">
      <p class="text-xs text-text-muted">{{ formatEntryDate(journal.createdAt) }}</p>
      <ActionButton size="sm" :icon="Trash2" tone="danger" @click.stop="$emit('ask-delete')">Delete</ActionButton>
    </div>
  </div>
</template>
