<script setup lang="ts">
import Skeleton from '../ui/Skeleton.vue'
</script>

<template>
  <div>
    <Skeleton class="mb-4 h-8 w-2/3" />
    <div class="mb-4 flex flex-wrap gap-2 rounded-lg border border-border p-4">
      <Skeleton v-for="i in 6" :key="i" class="h-8 w-20 rounded-full" />
    </div>
    <div class="space-y-3 rounded-lg border border-border p-4">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-5/6" />
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-4 w-1/2" />
    </div>
  </div>
</template>
