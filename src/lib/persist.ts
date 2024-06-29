import * as storage from './local-storage.js'
import { randomEmoji, randomId } from './utils.js'

type StateMetaData = {
  id: string
  title: string
  timestamp: number
}

const STATE_STORAGE_PREFIX = 'state-'
const CLIENT_ID_KEY = 'stream-clientId'

export function getUrlId() {
  const url = new URL(window.location.href)
  const q = url.searchParams.get('q')
  return q.replace(/(.+?_)?(.+)$/gi, '$2') // ignore any prefix like 'state_'
}

function addPrefix(id: string, title?: string) {
  const prefix = title ? slugify(title.slice(0, 50)) : ''
  return prefix ? `${prefix}_${id}` : id
}

export function setUrlId(id: string, title?: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('q', encodeURIComponent(addPrefix(id, title)))
  window.history.replaceState({}, '', url.toString())
}

export function makeUrl(id: string, title?: string) {
  return `${window.location.origin}/?q=${encodeURIComponent(addPrefix(id, title))}`
}

export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
}

export function saveToLocalStorage(state: { title: string; id: string }) {
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
