import { compressObjectToString, decompressStringToObject } from './compress.js'

const API_URL = 'https://state.dinky.dog'

export type DinkyData = {
  id: string
  lastSequence: number
  title?: string
  backgroundColor?: string
  nodes: Record<
    string,
    {
      id: string
      data: {
        operatorData: string
      }
      props: {
        x: number
        y: number
        width?: number
        height?: number
        background?: string
      }
      connections: { inputId: string }[]
    }
  >
}

export async function loadData(id: string): Promise<DinkyData> {
  const res = await fetch(API_URL + `?id=${encodeURIComponent(id)}`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  return await decompressStringToObject(json.data)
}

async function postData(id: string, data: any) {
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

function sendBeacon(id: string, data: any) {
  const res = navigator.sendBeacon(API_URL, JSON.stringify({ id, data }))
  if (!res) {
    throw new Error('Beacon failed')
  }
}

export async function saveData(data: any, useBeacon = false) {
  const encData = await compressObjectToString(data)
  if (useBeacon && navigator.sendBeacon) {
    return sendBeacon(data.id, encData)
  } else {
    return postData(data.id, encData)
  }
}
