import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient, AUTH_TOKEN_KEY } from '../graphql/client'
import { SignupDocument, LoginDocument, MeDocument } from '../graphql/operations/auth'
import { useThemeStore, type ThemeName } from './theme'
import { useFontStore, type FontFamilyName } from './font'

interface AuthUser {
  id: string
  email: string
  displayName?: string | null
  themePreference: string
  fontPreference: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY))
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(newToken: string, newUser: AuthUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(AUTH_TOKEN_KEY, newToken)
    useThemeStore().syncFromServer(newUser.themePreference as ThemeName)
    useFontStore().syncFromServer(newUser.fontPreference as FontFamilyName)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }

  async function signup(email: string, password: string, displayName?: string) {
    const result = await urqlClient
      .mutation(SignupDocument, { email, password, displayName })
      .toPromise()
    if (result.error || !result.data) {
      throw new Error(result.error?.graphQLErrors[0]?.message ?? 'Signup failed.')
    }
    setSession(result.data.signup.token, result.data.signup.user)
  }

  async function login(email: string, password: string) {
    const result = await urqlClient.mutation(LoginDocument, { email, password }).toPromise()
    if (result.error || !result.data) {
      throw new Error(result.error?.graphQLErrors[0]?.message ?? 'Login failed.')
    }
    setSession(result.data.login.token, result.data.login.user)
  }

  async function fetchMe() {
    if (!token.value) return
    const result = await urqlClient.query(MeDocument, {}, { requestPolicy: 'network-only' }).toPromise()
    if (result.data?.me) {
      user.value = result.data.me
      useThemeStore().syncFromServer(result.data.me.themePreference as ThemeName)
      useFontStore().syncFromServer(result.data.me.fontPreference as FontFamilyName)
    } else {
      logout()
    }
  }

  return { token, user, isAuthenticated, signup, login, logout, fetchMe }
})
