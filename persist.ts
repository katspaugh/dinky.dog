import * as storage from './services/local-storage.js'
import { loadData, saveData } from './services/database.js'
import { compressObjectToString, decompressStringToObject } from './utils/compress.js'
import { randomEmoji, randomId } from './utils/random.js'
import { debounce } from './utils/debounce.js'

type StateMetaData = {
  id: string
  title: string
  timestamp: number
}

const LOCAL_DEBOUNCE_TIME = 300
const DB_DEBOUNCE_TIME = 60e3

const STATE_STORAGE_PREFIX = 'state-'
const CLIENT_ID_KEY = 'stream-clientId'

const maxSavedStates = 100

function getUrlId() {
  const url = new URL(window.location.href)
  return url.searchParams.get('q')
}

export function makeUrl(id: string) {
  return `${window.location.origin}/?q=${encodeURIComponent(id)}`
}

export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
}

function saveToLocalStorage(state: StateMetaData) {
  // Save meta data to localStorage if it has a title
  if (state.title) {
    const key = `${STATE_STORAGE_PREFIX}${state.id}`
    const oldData = storage.getItem(key)
    const newData = {
      id: state.id,
      title: state.title,
      timestamp: Date.now(),
    }
    if (!oldData || JSON.stringify(oldData) !== JSON.stringify(newData)) {
      try {
        storage.setItem(key, newData)
      } catch (e) {
        console.error('Error saving to localStorage', e)
      }
    }
  }

  // Save entire state to sessionStorage
  {
    const prefix = `${STATE_STORAGE_PREFIX}-${state.id}`
    const count = storage.getItem<number>(`${prefix}-count`, true) || 0
    let newCount = count + 1
    if (newCount > maxSavedStates) {
      storage.removeItem(`${prefix}-state-${newCount - maxSavedStates}`, true)
    }
    storage.setItem(`${prefix}-state-${newCount}`, state, true)
    storage.setItem(`${prefix}-count`, newCount, true)
  }
}

export function loadPreviousState(stateId: string) {
  const prefix = `${STATE_STORAGE_PREFIX}-${stateId}`
  const count = storage.getItem<number>(`${prefix}-count`, true)
  if (!count) return null
  const newCount = count - 1
  storage.removeItem(`${prefix}-state-${count}`, true)
  storage.setItem(`${prefix}-count`, newCount, true)
  return storage.getItem(`${prefix}-state-${newCount}`, true)
}

async function saveToDatabase(state: any, useBeacon = false) {
  const data = await compressObjectToString(state)
  return saveData(state.id, data, useBeacon)
}

const debouncedDbSave = debounce(saveToDatabase, DB_DEBOUNCE_TIME)

const debouncedLocalSave = debounce(saveToLocalStorage, LOCAL_DEBOUNCE_TIME)

export function saveState(state: any, immediate = false, useBeacon = false) {
  if (!state.id) return
  immediate ? saveToLocalStorage(state) : debouncedLocalSave(state)
  return immediate ? saveToDatabase(state, useBeacon) : debouncedDbSave(state)
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
      } catch { }
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

export function getSavedStates(): StateMetaData[] {
  const states = storage.getMatchingItems<StateMetaData>(`${STATE_STORAGE_PREFIX}`)
  return Object.values(states).sort((a, b) => b.timestamp - a.timestamp)
}

function getBrowserName() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Brave', 'Opera', 'Edge']
  const oses = ['Windows', 'Mac', 'iOS', 'Android', 'Linux']
  const browser = browsers.find((browser) => navigator.userAgent.includes(browser)) || 'Unknown browser'
  const os = oses.find((os) => navigator.userAgent.includes(os)) || 'Unknown OS'
  return `${browser}/${os}`
}

export function getClientId(): string {
  const clientId = storage.getItem<string>(CLIENT_ID_KEY) || [getBrowserName(), randomEmoji(), randomId()].join('-')
  storage.setItem(CLIENT_ID_KEY, clientId)
  return clientId
}
