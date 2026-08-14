<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    icon?: Component
    iconSize?: number
    iconPosition?: 'left' | 'right'
    tone?: 'muted' | 'danger' | 'danger-emphasis' | 'primary'
    size?: 'sm' | 'md'
  }>(),
  { iconSize: 14, iconPosition: 'left', tone: 'muted', size: 'md' },
)

const toneClasses: Record<NonNullable<typeof props.tone>, string> = {
  muted: 'text-text-muted hover:text-text',
  danger: 'text-text-muted hover:text-red-600',
  'danger-emphasis': 'font-medium text-red-600 hover:text-red-700',
  primary: 'text-primary',
}
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1 transition-colors"
    :class="[size === 'sm' ? 'text-xs' : 'text-sm', toneClasses[tone]]"
  >
    <component :is="icon" v-if="icon && iconPosition === 'left'" :size="iconSize" />
    <slot />
    <component :is="icon" v-if="icon && iconPosition === 'right'" :size="iconSize" />
  </button>
</template>
