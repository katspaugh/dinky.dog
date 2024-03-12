import * as storage from './services/local-storage.js'
import { loadData, saveData, saveDataBeacon } from './services/database.js'
import { compressObjectToString, decompressStringToObject } from './utils/compress.js'
import { randomEmoji, randomId } from './utils/random.js'

const STATE_STORAGE_PREFIX = 'state-'
const CLIENT_ID_KEY = 'stream-clientId'

function getUrlId() {
  const url = new URL(window.location.href)
  return url.searchParams.get('q')
}

export function makeUrl(id) {
  return `${window.location.origin}/?q=${encodeURIComponent(id)}`
}

export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
}

function saveToLocalStorage(state) {
  const key = `${STATE_STORAGE_PREFIX}${state.id}`
  const oldData = storage.getItem(key)

  const newData = {
    id: state.id,
    title: state.title,
    timestamp: Date.now(),
  }

  if (oldData && JSON.stringify(oldData) === JSON.stringify(newData)) {
    return
  }

  try {
    storage.setItem(key, newData)
  } catch (e) {
    console.error('Error saving to localStorage', e)
  }
}

export async function saveState(state, useBeacon = false) {
  if (!state.id) return

  if (state.title) {
    saveToLocalStorage(state)
  }

  const data = await compressObjectToString(state)
  return await (useBeacon ? saveDataBeacon : saveData)(state.id, data)
}

export async function loadState() {
  // Try to get the state id from the URL
  let id = getUrlId()

  // Try to load state from URL hash
  if (!id) {
    const hash = window.location.hash.slice(1)
    if (hash.length > 20) {
      try {
        const state = await decompressStringToObject(hash)
        if (state.id) {
          id = state.id
          window.history.replaceState({}, '', `?q=${id}`)
          return state
        }
      } catch {}
    } else if (hash.length > 7) {
      id = hash
      window.history.replaceState({}, '', `?q=${id}`)
    }
  }

  // Try to load state from localStorage
  if (!id) {
    const savedStates = getSavedStates()
    if (savedStates[0]) {
      id = savedStates[0].id
      window.history.replaceState({}, '', `?q=${id}`)
    }
  }

  if (!id) return null

  // Try to load state from database
  try {
    const data = await loadData(id)
    if (data) {
      const state = await decompressStringToObject(data)
      state.id = id
      return state
    }
  } catch (e) {
    console.error('Error loading state', e)
  }

  return { id }
}

export function getSavedStates() {
  const states = storage.getMatchingItems(`${STATE_STORAGE_PREFIX}`)
  return Object.values(states).sort((a, b) => b.timestamp - a.timestamp)
}

function getBrowserName() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Brave', 'Opera', 'Edge']
  const oses = ['Windows', 'Mac', 'iOS', 'Android', 'Linux']
  const browser = browsers.find((browser) => navigator.userAgent.includes(browser)) || 'Unknown browser'
  const os = oses.find((os) => navigator.userAgent.includes(os)) || 'Unknown OS'
  return `${browser}/${os}`
}

export function getClientId() {
  const clientId = storage.getItem(CLIENT_ID_KEY) || [getBrowserName(), randomEmoji(), randomId()].join('-')
  storage.setItem(CLIENT_ID_KEY, clientId)
  return clientId
}
