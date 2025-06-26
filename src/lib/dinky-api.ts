import type { CanvasProps } from '../types/canvas.js'
import { supabase } from './supabase.js'

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
  const { data: row, error } = await supabase
    .from('documents')
    .select('data')
    .eq('id', id)
    .maybeSingle()

  if (error || !row) {
    throw new Error(error?.message || 'Document not found')
  }
  const data = JSON.parse(row.data)

  if (data.version === 2) {
    return data
  }
  return convertV1ToV2(data)
}

export async function saveDoc(data: DinkyDataV2, password?: string) {
  const encData = JSON.stringify(data)
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('documents')
    .upsert({ id: data.id, data: encData, password, user_id: userData?.user?.id })

  if (error) {
    throw error
  }
  return { status: 200, key: data.id }
}
export type SpaceMeta = { id: string; title?: string }

export async function listDocs(): Promise<SpaceMeta[]> {
  const { data, error } = await supabase.from('documents').select('id, data')

  if (error || !data) {
    throw error || new Error('Unable to load documents')
  }
  return data.map((row: { id: string; data: string }) => {
    try {
      const parsed = JSON.parse(row.data)
      return { id: row.id, title: parsed.title } as SpaceMeta
    } catch {
      return { id: row.id } as SpaceMeta
    }
  })
}
