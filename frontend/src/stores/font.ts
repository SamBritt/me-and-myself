import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { urqlClient } from '../graphql/client'
import { UpdateFontPreferenceDocument } from '../graphql/operations/font'

export const FONT_NAMES = ['SYSTEM', 'MONTSERRAT', 'LORA', 'JETBRAINS_MONO', 'NUNITO'] as const

export type FontFamilyName = (typeof FONT_NAMES)[number]

const FONT_STORAGE_KEY = 'meandmyself.font'
const FONT_CLASSES = FONT_NAMES.map((f) => `font-${f.toLowerCase()}`)

function applyToDom(font: FontFamilyName) {
  const root = document.documentElement
  root.classList.remove(...FONT_CLASSES)
  root.classList.add(`font-${font.toLowerCase()}`)
}

function readInitialFont(): FontFamilyName {
  const stored = localStorage.getItem(FONT_STORAGE_KEY)
  return (FONT_NAMES as readonly string[]).includes(stored ?? '') ? (stored as FontFamilyName) : 'SYSTEM'
}

export const useFontStore = defineStore('font', () => {
  const currentFont = ref<FontFamilyName>(readInitialFont())
  applyToDom(currentFont.value)

  watch(currentFont, (font) => {
    applyToDom(font)
    localStorage.setItem(FONT_STORAGE_KEY, font)
  })

  /** User-initiated change: update instantly, then persist server-side. */
  async function setFont(font: FontFamilyName) {
    currentFont.value = font
    await urqlClient.mutation(UpdateFontPreferenceDocument, { font }).toPromise()
  }

  /** Server is authoritative once we know the logged-in user's saved preference. */
  function syncFromServer(font: FontFamilyName) {
    currentFont.value = font
  }

  return { currentFont, setFont, syncFromServer }
})
