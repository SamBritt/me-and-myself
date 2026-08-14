<script setup lang="ts">
import Skeleton from '../ui/Skeleton.vue'
</script>

<template>
  <li class="border-b border-l-2 border-border border-l-transparent px-4 py-3">
    <Skeleton class="h-5 w-3/4" />
    <Skeleton class="mt-1 h-4 w-full" />
    <Skeleton class="mt-1 h-4 w-1/3" />
  </li>
</template>
