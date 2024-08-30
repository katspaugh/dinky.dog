import * as storage from './local-storage.js'
import { randomEmoji, randomId } from './utils.js'

type StateMetaData = {
  id: string
  title?: string
  timestamp: number
  password?: string
}

const STATE_STORAGE_PREFIX = 'state-'
const CLIENT_ID_KEY = 'stream-clientId'

export function saveToLocalStorage(state: Omit<StateMetaData, 'timestamp'>, password?: string) {
  const key = `${STATE_STORAGE_PREFIX}${state.id}`
  const newData = {
    id: state.id,
    title: state.title,
    timestamp: Date.now(),
    password,
  }
  try {
    storage.setItem(key, newData)
  } catch (e) {
    console.error('Error saving to localStorage', e)
  }
}

export function loadFromLocalStorage(id: string) {
  return storage.getItem<StateMetaData>(`${STATE_STORAGE_PREFIX}${id}`)
}

export function getSavedStates(): StateMetaData[] {
  const states = storage.getMatchingItems<StateMetaData>(`${STATE_STORAGE_PREFIX}`)
  return Object.values(states)
    .filter((item) => !!item.title)
    .sort((a, b) => b.timestamp - a.timestamp)
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
