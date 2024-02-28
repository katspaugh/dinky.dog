const API_URL = 'https://url-shortener.katspaugh.workers.dev/'

export async function loadFullHash(key) {
  const res = await fetch(API_URL + `?key=${encodeURIComponent(key)}`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const data = await res.json()
  return data.hash
}

export async function saveFullHash(hash) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ hash }),
  })
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const data = await res.json()

  if (data.error) {
    throw new Error(data.error)
  }

  if (!data.key) {
    throw new Error('No key in response')
  }

  return data.key
}
