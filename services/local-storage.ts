const PREFIX = 'dinky_'
const MAX_SIZE = 100 * 1024 // 100 KB

export function getItem<T>(key: string, session = false): T | null {
  const storage = session ? sessionStorage : localStorage
  try {
    const item = storage.getItem(PREFIX + key)
    return item == null ? item : JSON.parse(item)
  } catch (e) {
    console.error('Error getting item from localStorage', e)
    return null
  }
}

export function setItem(key: string, value: unknown, session = false) {
  const json = JSON.stringify(value)
  if (json.length > MAX_SIZE) {
    throw new Error('Item too large')
  }
  const storage = session ? sessionStorage : localStorage
  storage.setItem(PREFIX + key, json)
}

export function removeItem(key: string, session = false) {
  const storage = session ? sessionStorage : localStorage
  storage.removeItem(PREFIX + key)
}

export function getMatchingItems<T>(keyStart: string, session = false): Record<string, T> {
  const storage = session ? sessionStorage : localStorage

  return Object.keys(storage)
    .filter((key) => key.startsWith(PREFIX + keyStart))
    .reduce((acc, key) => {
      const noPrefixKey = key.slice(PREFIX.length)
      const value = getItem<T>(noPrefixKey, session)
      if (value != null) {
        acc[noPrefixKey] = value
      }
      return acc
    }, {})
}

export function clear(session = false) {
  const storage = session ? sessionStorage : localStorage
  storage.clear()
}
