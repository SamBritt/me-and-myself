<script setup lang="ts">
import { useThemeStore, type ThemeName } from '../../stores/theme'

const theme = useThemeStore()

const themes: { value: ThemeName; label: string; bg: string; accent: string }[] = [
  { value: 'LIGHT', label: 'Light', bg: '#fdfcfb', accent: '#7c3aed' },
  { value: 'DARK', label: 'Dark', bg: '#16171d', accent: '#c084fc' },
  { value: 'SEPIA', label: 'Sepia', bg: '#f4ecd8', accent: '#a1662f' },
  { value: 'FOREST', label: 'Forest', bg: '#101a14', accent: '#4ade80' },
  { value: 'SOLARIZED', label: 'Solarized', bg: '#fdf6e3', accent: '#268bd2' },
  { value: 'NORD', label: 'Nord', bg: '#2e3440', accent: '#88c0d0' },
  { value: 'ROSE', label: 'Rose', bg: '#fdf2f5', accent: '#db2777' },
  { value: 'HIGH_CONTRAST', label: 'High Contrast', bg: '#ffffff', accent: '#0000ee' },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <button
      v-for="option in themes"
      :key="option.value"
      type="button"
      class="flex flex-col items-center gap-2 rounded-lg border p-3 transition"
      :class="
        theme.currentTheme === option.value
          ? 'border-primary ring-1 ring-primary'
          : 'border-border hover:border-primary/50'
      "
      @click="theme.setTheme(option.value)"
    >
      <span
        class="flex h-10 w-full items-center justify-center rounded"
        :style="{ background: option.bg }"
      >
        <span class="h-3 w-3 rounded-full" :style="{ background: option.accent }" />
      </span>
      <span class="text-sm text-text">{{ option.label }}</span>
    </button>
  </div>
</template>
