import { compressObjectToString, decompressStringToObject } from './utils/compress.js'
import { loadFullHash, saveFullHash } from './services/url-shortener.js'
import * as storage from './services/local-storage.js'

const STATE_STORAGE_PREFIX = 'state-'

function setHash(hash) {
  window.location.hash = hash
}

function getHash() {
  return window.location.hash.slice(1)
}

export async function saveState(state) {
  const hash = await compressObjectToString(state)
  setHash(hash)

  try {
    storage.setItem(`${STATE_STORAGE_PREFIX}${state.id}`, {
      id: state.id,
      title: state.title,
      hash,
      timestamp: Date.now(),
    })
  } catch (e) {
    console.error('Error saving to localStorage', e)
  }
}

export async function loadState() {
  let hash = getHash()
  if (!hash) return

  // Short hash is a key to the full hash
  if (hash.length < 20) {
    hash = await loadFullHash(hash).catch(() => hash)
  }

  return decompressStringToObject(hash)
}

export async function getShortHash() {
  const hash = getHash()
  if (!hash) return
  const newHash = await saveFullHash(hash)
  return newHash
}

export function getSavedStates() {
  const states = storage.getMatchingItems(`${STATE_STORAGE_PREFIX}`)
  return Object.values(states).sort((a, b) => b.timestamp - a.timestamp)
}
