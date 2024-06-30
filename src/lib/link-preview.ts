const API_URL = 'https://preview.dinky.dog'

export type LinkPreview = {
  charset: string
  url: string
  title: string
  description?: string
  image?: string
}

export async function fetchPreview(url: string): Promise<LinkPreview> {
  const res = await fetch(API_URL + '?q=' + encodeURIComponent(url))
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}
