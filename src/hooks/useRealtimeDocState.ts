import { useCallback, useRef, useState } from 'react'
import type { CanvasNode } from '../types/canvas.js'
import { useDocState } from './useDocState.js'
import { useRealtimeChannel, type RealtimeAction } from './useRealtimeChannel.js'
import { debounce, randomId, randomBrightColor } from '../lib/utils.js'

export function useRealtimeDocState() {
  const state = useDocState()
  const { doc, setDoc } = state
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; color: string }>>({})
  const cursorColor = useRef(randomBrightColor())

  const apply = useCallback(
    (action: RealtimeAction, sender: string) => {
      switch (action.type) {
        case 'node:create':
          setDoc((d) => ({ ...d, nodes: d.nodes.concat(action.node) }))
          break
        case 'node:update':
          setDoc((d) => {
            const node = d.nodes.find((n) => n.id === action.id)
            if (node) Object.assign(node, action.props)
            return { ...d }
          })
          break
        case 'node:delete':
          setDoc((d) => ({
            ...d,
            nodes: d.nodes.filter((n) => n.id !== action.id),
            edges: d.edges.filter(
              (e) => e.fromNode !== action.id && e.toNode !== action.id,
            ),
          }))
          break
        case 'edge:create':
          setDoc((d) => ({ ...d, edges: d.edges.concat(action.edge) }))
          break
        case 'edge:delete':
          setDoc((d) => ({
            ...d,
            edges: d.edges.filter(
              (e) => !(e.fromNode === action.from && e.toNode === action.to),
            ),
          }))
          break
        case 'space:background':
          setDoc((d) => ({ ...d, backgroundColor: action.color }))
          break
        case 'space:title':
          setDoc((d) => ({ ...d, title: action.title }))
          break
        case 'cursor:move':
          setCursors((c) => ({ ...c, [sender]: { x: action.x, y: action.y, color: action.color } }))
          break
      }
    },
    [setDoc, setCursors],
  )

  const { send, clientId } = useRealtimeChannel(doc.id, { apply })

  const sendUpdate = useRef(
    debounce((id: string, props: Partial<CanvasNode>) => {
      send({ type: 'node:update', id, props })
    }, 50),
  )

  const sendCursor = useRef(
    debounce((x: number, y: number) => {
      send({ type: 'cursor:move', x, y, color: cursorColor.current })
    }, 20),
  )

  const onNodeCreate = useCallback(
    (props: Partial<CanvasNode>) => {
      const node = state.onNodeCreate(props)
      send({ type: 'node:create', node })
      return node
    },
    [state.onNodeCreate, send],
  )

  const onNodeDelete = useCallback(
    (id: string) => {
      state.onNodeDelete(id)
      send({ type: 'node:delete', id })
    },
    [state.onNodeDelete, send],
  )

  const onNodeUpdate = useCallback(
    (id: string, props: Partial<CanvasNode>) => {
      state.onNodeUpdate(id, props)
      sendUpdate.current(id, props)
    },
    [state.onNodeUpdate],
  )

  const onConnect = useCallback(
    (from: string, to: string) => {
      const edge = { id: randomId(), fromNode: from, toNode: to }
      setDoc((d) => ({ ...d, edges: d.edges.concat(edge) }))
      send({ type: 'edge:create', edge })
    },
    [setDoc, send],
  )

  const onDisconnect = useCallback(
    (from: string, to: string) => {
      state.onDisconnect(from, to)
      send({ type: 'edge:delete', from, to })
    },
    [state.onDisconnect, send],
  )

  const onBackgroundColorChange = useCallback(
    (color: string) => {
      state.onBackgroundColorChange(color)
      send({ type: 'space:background', color })
    },
    [state.onBackgroundColorChange, send],
  )

  const onTitleChange = useCallback(
    (title: string) => {
      setDoc((d) => ({ ...d, title }))
      send({ type: 'space:title', title })
    },
    [setDoc, send],
  )

  const onCursorMove = useCallback(
    (x: number, y: number) => {
      sendCursor.current(x, y)
    },
    [],
  )

  return {
    ...state,
    clientId,
    cursorColor: cursorColor.current,
    cursors,
    onNodeCreate,
    onNodeDelete,
    onNodeUpdate,
    onConnect,
    onDisconnect,
    onBackgroundColorChange,
    onTitleChange,
    onCursorMove,
  }
}
