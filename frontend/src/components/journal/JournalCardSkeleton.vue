<script setup lang="ts">
import Skeleton from '../ui/Skeleton.vue'
</script>

<template>
  <div class="flex min-h-[140px] flex-col justify-between rounded-lg border border-border bg-surface p-4">
    <div class="min-w-0">
      <Skeleton class="h-6 w-2/3" />
      <Skeleton class="mt-1 h-5 w-1/3" />
    </div>
    <div class="flex items-center justify-between">
      <Skeleton class="h-4 w-20" />
      <Skeleton class="h-4 w-14" />
    </div>
  </div>
</template>
