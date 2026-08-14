<script setup lang="ts">
import { useFontStore, type FontFamilyName } from '../../stores/font'

const font = useFontStore()

const fonts: { value: FontFamilyName; label: string; family: string }[] = [
  { value: 'SYSTEM', label: 'System', family: "system-ui, 'Segoe UI', Roboto, sans-serif" },
  { value: 'MONTSERRAT', label: 'Montserrat', family: "'Montserrat', sans-serif" },
  { value: 'LORA', label: 'Lora', family: "'Lora', serif" },
  { value: 'JETBRAINS_MONO', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { value: 'NUNITO', label: 'Nunito', family: "'Nunito', sans-serif" },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
    <button
      v-for="option in fonts"
      :key="option.value"
      type="button"
      class="flex flex-col items-center gap-2 rounded-lg border p-3 transition"
      :class="
        font.currentFont === option.value
          ? 'border-primary ring-1 ring-primary'
          : 'border-border hover:border-primary/50'
      "
      @click="font.setFont(option.value)"
    >
      <span class="text-2xl text-text" :style="{ fontFamily: option.family }">Aa</span>
      <span class="text-sm text-text">{{ option.label }}</span>
    </button>
  </div>
</template>
