const API_URL = 'https://dinky-state.katspaugh.workers.dev/'

export async function loadData(id) {
  const res = await fetch(API_URL + `?id=${encodeURIComponent(id)}`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  return json.data
}

export async function saveData(id, data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ id, data }),
  })
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  return json
}

export async function saveDataBeacon(id, data) {
  const json = JSON.stringify({ id, data })
  navigator.sendBeacon(API_URL, json)
}
