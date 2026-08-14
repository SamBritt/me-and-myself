<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{ icon: Component; label: string; size?: number }>(), {
  size: 18,
})
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center text-text-muted transition-colors hover:text-text"
    :title="label"
    :aria-label="label"
  >
    <component :is="icon" :size="size" />
  </button>
</template>
