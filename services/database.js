const API_URL = 'https://dinky-state.katspaugh.workers.dev/'

export async function loadData(id) {
  const res = await fetch(API_URL + `?id=${encodeURIComponent(id)}`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  return json.data
}

async function postData(id, data) {
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

async function sendBeacon(id, data) {
  const res = navigator.sendBeacon(API_URL, JSON.stringify({ id, data }))
  if (!res) {
    throw new Error('Beacon failed')
  }
}

export async function saveData(id, data, useBeacon = false) {
  if (useBeacon && navigator.sendBeacon) {
    return sendBeacon(id, data)
  } else {
    return postData(id, data)
  }
}
