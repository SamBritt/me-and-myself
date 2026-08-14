<script setup lang="ts">
import { onMounted } from 'vue'
import { provideClient } from '@urql/vue'
import { urqlClient } from './graphql/client'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useFontStore } from './stores/font'

provideClient(urqlClient)

// Instantiating these stores applies the localStorage/default theme + font to <html>
// immediately, before the first paint — the server's saved preference (if different) lands
// moments later via auth.fetchMe().
useThemeStore()
useFontStore()

const auth = useAuthStore()
onMounted(() => {
  auth.fetchMe()
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="route" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
