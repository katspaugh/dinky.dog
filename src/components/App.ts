import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { loadData } from '../lib/dinky-api.js'
import { Board } from './Board.js'

export function App() {
  const [doc, setDoc] = useState(null)

  useEffect(() => {
    loadData('fdf03a4f4f572e8c')
      .then(setDoc)
      .catch((err) => console.error(err))
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
