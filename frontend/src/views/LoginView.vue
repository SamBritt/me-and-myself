<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function onSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/journals')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-svh items-center justify-center bg-bg px-4">
    <form
      class="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <h1 class="mb-6 text-xl font-semibold text-text">Welcome back</h1>

      <label class="mb-3 block text-sm text-text-muted">
        Email
        <input
          v-model="email"
          type="email"
          required
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text"
        />
      </label>

      <label class="mb-4 block text-sm text-text-muted">
        Password
        <input
          v-model="password"
          type="password"
          required
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text"
        />
      </label>

      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>

      <p class="mt-4 text-center text-sm text-text-muted">
        No account?
        <RouterLink to="/signup" class="text-primary">Sign up</RouterLink>
      </p>
    </form>
  </main>
</template>
