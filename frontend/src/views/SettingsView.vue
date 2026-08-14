<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ThemePicker from '../components/layout/ThemePicker.vue'
import FontPicker from '../components/layout/FontPicker.vue'
import ActionButton from '../components/ui/ActionButton.vue'

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <main class="min-h-svh bg-bg text-text">
    <header class="flex items-center justify-between border-b border-border px-6 py-4">
      <div class="flex items-center gap-6">
        <h1 class="text-lg font-semibold">Me &amp; Myself</h1>
        <RouterLink to="/journals" class="text-sm text-text-muted hover:text-text">Journals</RouterLink>
        <RouterLink to="/insights" class="text-sm text-text-muted hover:text-text">Insights</RouterLink>
        <span class="text-sm font-medium text-primary">Settings</span>
      </div>
      <div class="flex items-center gap-4 text-sm text-text-muted">
        <span v-if="auth.user">{{ auth.user.displayName || auth.user.email }}</span>
        <ActionButton tone="primary" @click="onLogout">Log out</ActionButton>
      </div>
    </header>

    <div class="mx-auto max-w-2xl px-6 py-8">
      <h2 class="mb-2 text-xl font-semibold">Theme</h2>
      <p class="mb-4 text-sm text-text-muted">Pick the look you want while writing.</p>
      <ThemePicker />

      <h2 class="mb-2 mt-8 text-xl font-semibold">Font</h2>
      <p class="mb-4 text-sm text-text-muted">Pick the typeface you want across the app.</p>
      <FontPicker />
    </div>
  </main>
</template>
