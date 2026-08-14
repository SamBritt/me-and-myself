import { graphql } from '../generated'

export const SignupDocument = graphql(`
  mutation Signup($email: String!, $password: String!, $displayName: String) {
    signup(email: $email, password: $password, displayName: $displayName) {
      token
      user {
        id
        email
        displayName
        themePreference
        fontPreference
      }
    }
  }
`)

export const LoginDocument = graphql(`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        displayName
        themePreference
        fontPreference
      }
    }
  }
`)

export const MeDocument = graphql(`
  query Me {
    me {
      id
      email
      displayName
      themePreference
      fontPreference
    }
  }
`)
