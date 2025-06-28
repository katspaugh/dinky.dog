import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { randomId } from '../lib/utils.js'
import type { CanvasNode, CanvasEdge } from '../types/canvas.js'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeAction =
  | { type: 'node:create'; node: CanvasNode }
  | { type: 'node:update'; id: string; props: Partial<CanvasNode> }
  | { type: 'node:delete'; id: string }
  | { type: 'edge:create'; edge: CanvasEdge }
  | { type: 'edge:delete'; from: string; to: string }
  | { type: 'space:background'; color: string }
  | { type: 'space:title'; title: string }

export function useRealtimeChannel(
  docId: string,
  handlers: { apply: (action: RealtimeAction) => void },
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const clientId = useRef(randomId())

  useEffect(() => {
    if (!docId) return
    const channel = supabase.channel(`space:${docId}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'action' }, ({ payload }) => {
      if (!payload) return
      if (payload.clientId === clientId.current) return
      handlers.apply(payload.action as RealtimeAction)
    })

    channel.subscribe()
    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [docId, handlers])

  const send = useCallback((action: RealtimeAction) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'action',
      payload: { clientId: clientId.current, action },
    })
  }, [])

  return { send }
}
