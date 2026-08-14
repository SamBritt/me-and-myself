<script setup lang="ts">
import Skeleton from '../ui/Skeleton.vue'
</script>

<template>
  <div class="rounded-lg border border-border bg-surface p-4">
    <Skeleton class="h-6 w-1/2" />
    <Skeleton class="mt-1 h-5 w-full" />
    <Skeleton class="mt-1 h-5 w-2/3" />
    <Skeleton class="mt-2 h-4 w-24" />
  </div>
</template>
