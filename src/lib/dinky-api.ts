import type { CanvasProps } from '../types/canvas.js'
import { stripHtml } from './sanitize-html.js'
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

  return data
}

export async function saveDoc(data: DinkyDataV2, userId: string): Promise<{ status: number; key: string }> {
  const encData = JSON.stringify(data)
  const { error } = await supabase
    .from('documents')
    .upsert({ id: data.id, data: encData, user_id: userId })

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
      return { id: row.id, title: parsed.title || stripHtml(parsed.nodes[0]?.content || '') } as SpaceMeta
    } catch {
      return { id: row.id } as SpaceMeta
    }
  })
}

export async function deleteDoc(id: string) {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) {
    throw error
  }
}
