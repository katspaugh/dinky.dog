import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { type DinkyDataV2, loadData, saveData } from '../lib/dinky-api.js'
import { Board } from './Board.js'
import type { CanvasNode } from '../types/canvas.js'
import { Sidebar } from './Sidebar.js'
import { Fragment } from 'https://esm.sh/preact'
import { saveToLocalStorage } from '../lib/persist.js'

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

  useEffect(() => {
    document.body.style.backgroundColor = doc?.backgroundColor ?? ''
  }, [doc?.backgroundColor])

  const onNodeCreate = useCallback((props: Partial<CanvasNode>) => {
    const id = Math.random().toString(36).slice(2)
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

    setTimeout(() => {
      document.getElementById(id)?.focus()
    }, 100)

    return node
  }, [])

  const onNodeDelete = useCallback((id: string) => {
    setDoc((doc) => {
      doc.nodes = doc.nodes.filter((node) => node.id !== id)
      doc.edges = doc.edges.filter((edge) => edge.fromNode !== id && edge.toNode !== id)
      return { ...doc }
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

  useEffect(() => {
    if (!doc) return
    saveToLocalStorage(doc)
  }, [doc])

  return html`<${Fragment}>
<${Board}
    ...${doc}
    onNodeCreate=${onNodeCreate}
    onNodeDelete=${onNodeDelete}
    onNodeUpdate=${onNodeUpdate}
    onConnect=${onConnect}
    onDisconnect=${onDisconnect}
  />

  <${Sidebar} />
</${Fragment}>
`
}
