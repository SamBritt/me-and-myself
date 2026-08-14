<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    active?: boolean
    icon?: Component
    iconSize?: number
    iconPosition?: 'left' | 'right'
    size?: 'sm' | 'md'
  }>(),
  { iconSize: 16, iconPosition: 'left', size: 'sm' },
)
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1.5 rounded text-sm transition-colors"
    :class="[
      size === 'md' ? 'px-3 py-1.5' : 'px-2 py-1',
      active ? 'bg-primary text-white' : 'text-text hover:bg-border/50',
    ]"
  >
    <component :is="icon" v-if="icon && iconPosition === 'left'" :size="iconSize" />
    <slot />
    <component :is="icon" v-if="icon && iconPosition === 'right'" :size="iconSize" />
  </button>
</template>
