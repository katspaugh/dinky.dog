const API_URL = 'https://link-preview.katspaugh.workers.dev/?q='

export async function fetchPreview(url) {
  const res = await fetch(API_URL + encodeURIComponent(url))
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}
