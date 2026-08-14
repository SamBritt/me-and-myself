import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient } from '../graphql/client'
import { UpdateThemePreferenceDocument } from '../graphql/operations/theme'

export const THEME_NAMES = [
  'LIGHT',
  'DARK',
  'SEPIA',
  'FOREST',
  'SOLARIZED',
  'NORD',
  'ROSE',
  'HIGH_CONTRAST',
] as const

export type ThemeName = (typeof THEME_NAMES)[number]

const THEME_STORAGE_KEY = 'meandmyself.theme'
const THEME_CLASSES = THEME_NAMES.map((t) => `theme-${t.toLowerCase()}`)

function applyToDom(theme: ThemeName) {
  const root = document.documentElement
  root.classList.remove(...THEME_CLASSES)
  root.classList.add(`theme-${theme.toLowerCase()}`)
}

function readInitialTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (THEME_NAMES as readonly string[]).includes(stored ?? '') ? (stored as ThemeName) : 'LIGHT'
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>(readInitialTheme())
  applyToDom(currentTheme.value)

  watch(currentTheme, (theme) => {
    applyToDom(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  })

  /** User-initiated change: update instantly, then persist server-side. */
  async function setTheme(theme: ThemeName) {
    currentTheme.value = theme
    await urqlClient.mutation(UpdateThemePreferenceDocument, { theme }).toPromise()
  }

  /** Server is authoritative once we know the logged-in user's saved preference. */
  function syncFromServer(theme: ThemeName) {
    currentTheme.value = theme
  }

  return { currentTheme, setTheme, syncFromServer }
})
