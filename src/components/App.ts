import { useCallback, useEffect, useRef } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { loadDoc, saveDoc } from '../lib/dinky-api.js'
import { Board } from './Board.js'
import { Sidebar } from './Sidebar.js'
import { saveToLocalStorage } from '../lib/persist.js'
import { Drop } from './Drop.js'
import { uploadImage } from '../lib/upload-image.js'
import { randomId } from '../lib/utils.js'
import { getUrlId, setUrlId } from '../lib/url.js'
import { useDocState } from '../hooks/useDocState.js'
import { useBeforeUnload } from '../hooks/useBeforeUnload.js'

const TITLE = 'Dinky Dog'
const FILE_TYPES = /image\/.*/

export function App() {
  const { doc, setDoc,onNodeCreate, onNodeDelete, onNodeUpdate, onConnect, onDisconnect, onBackgroundColorChange } = useDocState()
  const originalDoc = useRef(JSON.stringify(doc))

  // Upload image
  const onFileDrop = useCallback(({ x, y, file }) => {
    const src = URL.createObjectURL(file)
    const node = onNodeCreate({ x, y, content: `<img src=${src} />` })

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
  }, [onNodeCreate, onNodeUpdate, onNodeDelete])

  // Load doc from URL
  useEffect(() => {
    const id = getUrlId()

    if (id) {
      loadDoc(id)
        .then((doc) => {
          console.log('Loaded doc', doc)
          originalDoc.current = JSON.stringify(doc)
          setDoc(doc)
          setUrlId(doc.id, doc.title)
        })
        .catch((err) => console.error('Error loading doc', err))
    } else {
      const newId = randomId()
      setDoc((doc) => ({ ...doc, id: newId }))
      setUrlId(newId)
    }
  }, [])

  // Save doc on unload
  useBeforeUnload(useCallback(() => {
    setDoc((doc) => {
      if (doc.id && doc.title && JSON.stringify(doc) !== originalDoc.current) {
        saveDoc(doc, undefined, true)
      }
      return doc
    })
  }, [setDoc, originalDoc.current]))

  // Update title
  useEffect(() => {
    document.title = doc?.title ? `${TITLE} — ${doc.title}` : TITLE
  }, [doc?.title])

  // Update background color
  useEffect(() => {
    document.body.style.backgroundColor = doc?.backgroundColor ?? ''
  }, [doc?.backgroundColor])

  // Save doc to local storage
  useEffect(() => {
    saveToLocalStorage(doc)
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
