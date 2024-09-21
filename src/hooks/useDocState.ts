import { useCallback, useState } from 'https://esm.sh/preact/hooks'
import type { DinkyDataV2 } from '../lib/dinky-api'
import type { CanvasNode } from '../types/canvas'
import { randomId } from '../lib/utils.js'

export function useDocState() {
  const [_doc, setDoc] = useState<DinkyDataV2>({ nodes: [], edges: [], id: '', lastSequence: 0, version: 2 })

  const onNodeCreate = useCallback((props: Partial<CanvasNode>) => {
    const id = randomId()
    const node = {
      id,
      type: 'text',
      width: undefined,
      height: undefined,
      x: 0,
      y: 0,
      content: '',
      ...props,
    }

    setDoc((doc) => {
      doc.nodes.push(node)
      return { ...doc }
    })

    return node
  }, [])

  const onNodeDelete = useCallback((id: string) => {
    setDoc((doc) => {
      const nodes = doc.nodes.filter((node) => node.id !== id)
      const edges = doc.edges.filter((edge) => edge.fromNode !== id && edge.toNode !== id)
      return { ...doc, nodes, edges }
    })
  }, [])

  const onNodeUpdate = useCallback((id: string, props: Partial<CanvasNode>) => {
    setDoc((doc) => {
      const node = doc.nodes.find((node) => node.id === id)
      if (!node) return doc
      Object.assign(node, props)
      return { ...doc }
    })
  }, [])

  const onConnect = useCallback((from: string, to: string) => {
    setDoc((doc) => {
      return { ...doc, edges: doc.edges.concat({ id: randomId(), fromNode: from, toNode: to }) }
    })
  }, [])

  const onDisconnect = useCallback((from: string, to: string) => {
    setDoc((doc) => {
      return { ...doc, edges: doc.edges.filter((edge) => edge.fromNode !== from || edge.toNode !== to) }
    })
  }, [])

  const onBackgroundColorChange = useCallback((color: string) => {
    setDoc((doc) => {
      return { ...doc, backgroundColor: color }
    })
  }, [])

  return { doc: _doc, setDoc, onNodeCreate, onNodeDelete, onNodeUpdate, onConnect, onDisconnect, onBackgroundColorChange }
}
