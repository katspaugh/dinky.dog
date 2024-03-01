import { compressObjectToString, decompressStringToObject } from './utils/compress.js'
import { loadFullHash, saveFullHash } from './services/url-shortener.js'

function setHash(hash) {
  window.location.hash = hash
}

function getHash() {
  return window.location.hash.slice(1)
}

export async function saveState(state) {
  const hash = await compressObjectToString(state)
  setHash(hash)
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
