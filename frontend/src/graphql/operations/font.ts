import { graphql } from '../generated'

export const UpdateFontPreferenceDocument = graphql(`
  mutation UpdateFontPreference($font: FontFamily!) {
    updateFontPreference(font: $font) {
      id
      fontPreference
    }
  }
`)
