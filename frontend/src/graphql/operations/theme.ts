import { graphql } from '../generated'

export const UpdateThemePreferenceDocument = graphql(`
  mutation UpdateThemePreference($theme: ThemeName!) {
    updateThemePreference(theme: $theme) {
      id
      themePreference
    }
  }
`)
