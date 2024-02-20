export function setHashData(data) {
  window.location.hash = btoa(JSON.stringify(data))
}

export function getHashData() {
  const hash = window.location.hash.slice(1)
  if (!hash) return
  try {
    return JSON.parse(atob(hash))
  } catch {
    return
  }
}
