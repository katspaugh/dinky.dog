import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { type DinkyDataV2, loadData, saveData } from '../lib/dinky-api.js'
import { Board } from './Board.js'

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

  const onNodeUpdate = useCallback((id, props) => {
    setDoc((doc) => {
      const node = doc.nodes.find((node) => node.id === id)
      if (!node) return doc
      Object.assign(node, props)
      return { ...doc }
    })
  }, [])

  return html`<${Board} ...${doc} onNodeUpdate=${onNodeUpdate} />`
}
