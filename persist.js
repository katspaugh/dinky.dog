import { compressObjectToString, decompressStringToObject } from './utils/compress.js'

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
  const hash = getHash()
  if (!hash) return
  return decompressStringToObject(hash)
}
