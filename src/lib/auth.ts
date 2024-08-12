import { getItem, setItem, removeItem } from './local-storage.js'

const AUTH_URL = 'https://dinky-github-auth.katspaugh.workers.dev'
const USER_API_URL = 'https://api.github.com/user'
const TOKEN_KEY = 'auth-token'
const CODE_PARAM = 'code'

let token = getItem(TOKEN_KEY)

export async function initAuth() {
  const code = new URLSearchParams(location.search).get(CODE_PARAM)
  if (!code) return

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error('Failed to login')
  }

  const result = await response.json()

  if (result.error) {
    throw new Error(result.error)
  }

  token = result.token

  // save the token
  setItem(TOKEN_KEY, token)
}

export function isLoggedIn() {
  return !!token
}

export function login() {
  if (!token) {
    // Redirect to the auth worker
    location.href = AUTH_URL
  }
  return token
}

export function logout() {
  token = ''
  removeItem(TOKEN_KEY)
}

export async function getUser() {
  if (!token) {
    throw new Error('Not logged in')
  }

  const response = await fetch(USER_API_URL, {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }

  const user = await response.json()

  return user
}
