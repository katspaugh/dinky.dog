import type { CanvasProps } from '../types/canvas.js'
import { compressObjectToString, decompressStringToObject } from './compress.js'

const API_URL = 'https://state.dinky.dog'

type CommonDinkyData = {
  id: string
  lastSequence: number
  title?: string
  backgroundColor?: string
}

export type DinkyDataV2 = CommonDinkyData &
  CanvasProps & {
    id: string
    lastSequence: number
    title?: string
    backgroundColor?: string
    isLocked?: boolean
    creator?: string
    version: 2
  }

export type DinkyDataV1 = CommonDinkyData & {
  id: string
  lastSequence: number
  title?: string
  backgroundColor?: string
  isLocked?: boolean
  creator: string
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

function convertV1ToV2(data: DinkyDataV1): DinkyDataV2 {
  const nodes = Object.entries(data.nodes).map(([id, node]) => {
    return {
      id,
      type: 'text',
      content: node.data.operatorData,
      x: node.props.x,
      y: node.props.y,
      width: node.props.width,
      height: node.props.height,
      color: node.props.background,
    }
  })

  const edges = Object.entries(data.nodes).reduce<{ id: string; fromNode: string; toNode: string }[]>(
    (acc, [id, node]) => {
      node.connections?.forEach((conn) => {
        acc.push({ id: Math.random().toString(), fromNode: id, toNode: conn.inputId })
      })
      return acc
    },
    [],
  )

  return { ...data, nodes, edges, version: 2 }
}

export async function loadDoc(id: string): Promise<DinkyDataV2> {
  const res = await fetch(API_URL + `?id=${encodeURIComponent(id)}&timestamp=${Date.now()}`)
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  const data = await decompressStringToObject(json.data)

  if (data.version === 2) {
    return data
  }
  return convertV1ToV2(data)
}

async function postData(id: string, data: string, password?: string): Promise<{ key: string, status: number }> {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ id, data, password }),
  })
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }
  const json = await res.json()
  return json
}

function sendBeacon(id: string, data: string, password?: string) {
  const res = navigator.sendBeacon(API_URL, JSON.stringify({ id, data, password }))
  if (!res) {
    throw new Error('Beacon failed')
  }
}
export async function saveDoc(data: DinkyDataV2, password?: string, isUnload = false) {
  const encData = await compressObjectToString(data)
  const sendFn = isUnload ? sendBeacon : postData
  return sendFn(data.id, encData, password)
}
