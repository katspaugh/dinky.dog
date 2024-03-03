const PREFIX = 'dinky_'
const MAX_SIZE = 100 * 1024 // 100 KB

export function getItem(key) {
  try {
    const item = localStorage.getItem(PREFIX + key)
    return item == null ? item : JSON.parse(item)
  } catch (e) {
    console.error('Error getting item from localStorage', e)
    return null
  }
}

export function setItem(key, value) {
  const json = JSON.stringify(value)
  if (json.length > MAX_SIZE) {
    throw new Error('Item too large')
  }
  localStorage.setItem(PREFIX + key, json)
}

export function getMatchingItems(keyStart) {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX + keyStart))
    .reduce((acc, key) => {
      const noPrefixKey = key.slice(PREFIX.length)
      const value = getItem(noPrefixKey)
      acc[noPrefixKey] = value
      return acc
    }, {})
}
