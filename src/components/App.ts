import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { type DinkyDataV2, loadData, saveData } from '../lib/dinky-api.js'
import { Board } from './Board.js'
import type { CanvasNode } from '../types/canvas.js'
import { Sidebar } from './Sidebar.js'
import { saveToLocalStorage } from '../lib/persist.js'
import { Drop } from './Drop.js'
import { uploadImage } from '../lib/upload-image.js'

const TITLE = 'Dinky Dog'
const FILE_TYPES = /image\/.*/

export function App() {
  const [doc, setDoc] = useState<DinkyDataV2>({ nodes: [], edges: [], id: '', lastSequence: 0, version: 2 })

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
      if (!doc.id) return
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

    if (!node.content) {
      setTimeout(() => {
        document.getElementById(id)?.focus()
      }, 100)
    }

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
      return { ...doc, edges: doc.edges.concat({ id: Math.random().toString(), fromNode: from, toNode: to }) }
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

  const onFileDrop = useCallback(({ x, y, file }) => {
    const src = URL.createObjectURL(file)
    const node = onNodeCreate({ x, y, content: `<img src=${src} />` })

    setDoc((doc) => {
      return { ...doc, nodes: [...doc.nodes, node] }
    })

    uploadImage(file)
      .then((newSrc) => {
        URL.revokeObjectURL(src)
        onNodeUpdate(node.id, { content: `<img src=${newSrc} />` })
      })
      .catch((err) => {
        console.error('Error uploading image', err)
        URL.revokeObjectURL(src)
        onNodeDelete(node.id)
      })
  }, [onNodeCreate, onNodeUpdate])

  useEffect(() => {
    if (doc.id) {
      saveToLocalStorage(doc)
    }
  }, [doc])

  return html`
    <${Drop}
      fileTypes=${FILE_TYPES}
      onFileDrop=${onFileDrop}
    >
      <${Board}
        ...${doc}
      onNodeCreate=${onNodeCreate}
      onNodeDelete=${onNodeDelete}
      onNodeUpdate=${onNodeUpdate}
      onConnect=${onConnect}
      onDisconnect=${onDisconnect}
      onBackgroundColorChange=${onBackgroundColorChange}
    />

    <${Sidebar} />
  </${Drop}>
`
}
