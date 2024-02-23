import { compressObjectToString, decompressStringToObject } from './compress.js'

export async function setHashData(data) {
  const hash = await compressObjectToString(data)
  window.location.hash = hash
}

export async function getHashData() {
  const hash = window.location.hash.slice(1)
  if (!hash) return
  return decompressStringToObject(hash)
}
