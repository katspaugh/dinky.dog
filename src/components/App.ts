import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { type DinkyDataV2, loadData, saveData } from '../lib/dinky-api.js'
import { Board } from './Board.js'
import type { CanvasNode } from '../types/canvas.js'

const TITLE = 'Dinky Dog'

export function App() {
  const [doc, setDoc] = useState<DinkyDataV2>(null)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('q')
    if (!id) return
    let originalDoc = ''

    loadData(id)
      .then((doc) => {
        originalDoc = JSON.stringify(doc)
        setDoc(doc)
      })
      .catch((err) => console.error(err))

    const onUnload = () => {
      const lastDoc = JSON.stringify(doc)
      if (lastDoc === originalDoc) return
      console.log('Saving...')
      setDoc((doc) => {
        saveData(doc, undefined, true)
        return doc
      })
    }

    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])

  useEffect(() => {
    document.title = doc?.title ? `${TITLE} — ${doc.title}` : TITLE
  }, [doc?.title])

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
      doc.edges.push({ id: Math.random().toString(), fromNode: from, toNode: to })
      return { ...doc }
    })
  }, [])

  const onDisconnect = useCallback((from: string, to: string) => {
    setDoc((doc) => {
      doc.edges = doc.edges.filter((edge) => edge.fromNode !== from || edge.toNode !== to)
      return { ...doc }
    })
  }, [])

  return html`<${Board} ...${doc} onNodeUpdate=${onNodeUpdate} onConnect=${onConnect} onDisconnect=${onDisconnect} />`
}
