<script setup lang="ts">
import { Angry, Annoyed, Frown, FaceSlightlyFrowning, Meh, Smile, SmilePlus, Laugh } from '@lucide/vue'
import ToggleButton from '../ui/ToggleButton.vue'

const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

// 8 distinct Lucide face icons across 11 mood levels — the two most extreme steps on each end
// reuse the adjacent icon (Angry, Smile, Laugh); the name shown on each button is what tells
// those pairs apart, no color-coding needed.
const moods = [
  { value: 0, icon: Angry, label: 'Livid' },
  { value: 1, icon: Angry, label: 'Awful' },
  { value: 2, icon: Annoyed, label: 'Bad' },
  { value: 3, icon: Frown, label: 'Down' },
  { value: 4, icon: FaceSlightlyFrowning, label: 'Meh' },
  { value: 5, icon: Meh, label: 'Okay' },
  { value: 6, icon: Smile, label: 'Fine' },
  { value: 7, icon: Smile, label: 'Good' },
  { value: 8, icon: SmilePlus, label: 'Great' },
  { value: 9, icon: Laugh, label: 'Amazing' },
  { value: 10, icon: Laugh, label: 'Fantastic' },
]

function onSelect(value: number) {
  emit('update:modelValue', props.modelValue === value ? null : value)
}
</script>

<template>
  <div class="rounded-lg border border-border bg-surface px-4 py-3">
    <span class="mb-2 block text-sm text-text-muted">Mood today</span>
    <div class="flex flex-wrap gap-1.5">
      <ToggleButton
        v-for="(mood, i) in moods"
        :key="mood.value"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }"
        :active="modelValue === mood.value"
        :icon="mood.icon"
        icon-position="right"
        size="md"
        @click="onSelect(mood.value)"
      >
        {{ mood.label }}
      </ToggleButton>
    </div>
  </div>
</template>
