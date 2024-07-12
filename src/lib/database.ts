import { compressObjectToString, decompressStringToObject } from './compress.js'

const API_URL = 'https://state.dinky.dog'

type CommonDinkyData = {
  id: string
  lastSequence: number
  title?: string
  backgroundColor?: string
}

export type DinkyDataV2 = CommonDinkyData & {
  id: string
  lastSequence: number
  title?: string
  backgroundColor?: string
  isLocked?: boolean
  creator?: string
  nodes: Array<{
    id: string
    x: number
    y: number
    content?: string
    width?: number
    height?: number
    color?: string
  }>
  edges: Array<{
    fromNode: string
    toNode: string
  }>
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
      content: node.data.operatorData,
      x: node.props.x,
      y: node.props.y,
      width: node.props.width,
      height: node.props.height,
      color: node.props.background,
    }
  })

  const edges = Object.entries(data.nodes).reduce<{ fromNode: string; toNode: string }[]>((acc, [id, node]) => {
    node.connections?.forEach((conn) => {
      acc.push({ fromNode: id, toNode: conn.inputId })
    })
    return acc
  }, [])

  return { ...data, nodes, edges, version: 2 }
}

export async function loadData(id: string, cacheBust?: string): Promise<DinkyDataV2> {
  const res = await fetch(API_URL + `?id=${encodeURIComponent(id)}&timestamp=${cacheBust ?? ''}`)
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
