import { Client, cacheExchange, fetchExchange } from '@urql/vue'

export const AUTH_TOKEN_KEY = 'meandmyself.token'

export const urqlClient = new Client({
  url: import.meta.env.VITE_GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const headers: Record<string, string> = {}
    if (token) headers.authorization = `Bearer ${token}`
    return { headers }
  },
})
