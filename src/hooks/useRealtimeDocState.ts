import { useCallback, useRef, useState, useEffect } from 'react'
import type { CanvasNode } from '../types/canvas.js'
import { useDocState } from './useDocState.js'
import { useRealtimeChannel, type RealtimeAction } from './useRealtimeChannel.js'
import { debounce, randomId, randomBrightColor, throttleTranslate } from '../lib/utils.js'
import { supabase } from '../lib/supabase.js'
import { loadDoc } from '../lib/dinky-api.js'

export function useRealtimeDocState() {
  const state = useDocState()
  const { doc, setDoc } = state
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; color: string }>>({})
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const cursorColor = useRef(randomBrightColor())

  useEffect(() => {
    if (!doc.id) return

    const channel = supabase
      .channel(`space:updates:${doc.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents', filter: `id=eq.${doc.id}` },
        () => {
          loadDoc(doc.id)
            .then((newDoc) => {
              setDoc(newDoc)
            })
            .catch((err) => console.error('Error refreshing doc', err))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [doc.id, setDoc])

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
        case 'node:translate':
          setDoc((d) => {
            const node = d.nodes.find((n) => n.id === action.id)
            if (node) {
              node.x = Math.round(node.x + action.dx)
              node.y = Math.round(node.y + action.dy)
            }
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
        case 'node:select':
          setSelections((s) => ({ ...s, [sender]: action.ids }))
          setCursors((c) => ({
            ...c,
            [sender]: {
              x: c[sender]?.x ?? 0,
              y: c[sender]?.y ?? 0,
              color: action.color,
            },
          }))
          break
      }
    },
    [setDoc, setCursors, setSelections],
  )

  const { send, clientId } = useRealtimeChannel(doc.id, { apply })

  const sendUpdate = useRef(
    debounce((id: string, props: Partial<CanvasNode>) => {
      send({ type: 'node:update', id, props })
    }, 50),
  )

  const sendMove = useRef(
    throttleTranslate((id: string, dx: number, dy: number) => {
      send({ type: 'node:translate', id, dx, dy })
    }, 50),
  )

  const sendCursor = useRef(
    debounce((x: number, y: number) => {
      send({ type: 'cursor:move', x, y, color: cursorColor.current })
    }, 20),
  )

  const sendSelection = useRef(
    debounce((ids: string[]) => {
      send({ type: 'node:select', ids, color: cursorColor.current })
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
      const node = doc.nodes.find((n) => n.id === id)
      let dx = 0
      let dy = 0
      if (node) {
        if (props.x !== undefined) dx = props.x - node.x
        if (props.y !== undefined) dy = props.y - node.y
      }
      state.onNodeUpdate(id, props)
      if (dx || dy) {
        sendMove.current(id, dx, dy)
      }
      const otherProps = { ...props }
      delete otherProps.x
      delete otherProps.y
      if (Object.keys(otherProps).length) {
        sendUpdate.current(id, otherProps)
      }
    },
    [state.onNodeUpdate, doc.nodes],
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

  const onSelectNodes = useCallback(
    (ids: string[]) => {
      sendSelection.current(ids)
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
    selections,
    onSelectNodes,
  }
}
