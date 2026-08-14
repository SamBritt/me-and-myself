<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const displayName = ref('')
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
    await auth.signup(email.value, password.value, displayName.value || undefined)
    router.push('/journals')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Signup failed.'
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
      <h1 class="mb-6 text-xl font-semibold text-text">Create your account</h1>

      <label class="mb-3 block text-sm text-text-muted">
        Name (optional)
        <input
          v-model="displayName"
          type="text"
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text"
        />
      </label>

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
        Password (min 8 characters)
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text"
        />
      </label>

      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {{ loading ? 'Creating account…' : 'Sign up' }}
      </button>

      <p class="mt-4 text-center text-sm text-text-muted">
        Already have an account?
        <RouterLink to="/login" class="text-primary">Log in</RouterLink>
      </p>
    </form>
  </main>
</template>
