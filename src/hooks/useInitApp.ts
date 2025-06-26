import { useCallback, useEffect, useMemo, useRef } from 'react'
import { getUrlId, setUrlId } from '../lib/url'
import { saveToLocalStorage } from '../lib/persist'
import { loadDoc, saveDoc } from '../lib/dinky-api'
import { useBeforeUnload } from './useBeforeUnload'
import { randomId } from '../lib/utils'
import { type useDocState } from './useDocState'
import { usePassword } from './usePassword'

const TITLE = 'Dinky Dog'

export function useInitApp(state: ReturnType<typeof useDocState>) {
  const { doc, setDoc } = state
  const stringDoc = useMemo(() => JSON.stringify(doc), [doc])
  const originalDoc = useRef(stringDoc)
  const [password, updatePassword] = usePassword(doc.id)

  // Load doc from URL
  useEffect(() => {
    const id = getUrlId()

    if (id) {
      setDoc((prevDoc) => {
        if (prevDoc.id !== id) {
          loadDoc(id)
            .then((newDoc) => {
              console.log('Loaded doc', id, newDoc)
              originalDoc.current = JSON.stringify(newDoc)
              setDoc(newDoc)
              setUrlId(newDoc.id, newDoc.title)
            })
            .catch((err) => console.error('Error loading doc', err))
          return { ...prevDoc, id }
        }
        return prevDoc
      })
    } else {
      const newId = randomId()
      setDoc((newDoc) => ({ ...newDoc, id: newId }))
      setUrlId(newId)
    }
  }, [setDoc])

  // Save doc on unload
  useBeforeUnload(useCallback(() => {
    setDoc((doc) => {
      if (doc.id && doc.title && JSON.stringify(doc) !== originalDoc.current) {
        saveDoc(doc, password)
      }
      return doc
    })
  }, [setDoc, password]))

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
    saveToLocalStorage(doc, password)
  }, [doc, password])

  // On lock change handler
  const onLockChange = useCallback((isLocked: boolean) => {
    setDoc((prevDoc) => {
      const newDoc = { ...prevDoc, isLocked }
      saveDoc(newDoc, updatePassword())
        .catch((err) => {
          setDoc((prevDoc) => ({ ...prevDoc, isLocked: !isLocked }))
          console.error('Error saving doc', err)
        })
      return newDoc
    })
  }, [setDoc, updatePassword])

  // On title change handler
  const onTitleChange = useCallback((title: string) => {
    setDoc((doc) => ({ ...doc, title }))
  }, [setDoc])

  return { onLockChange, onTitleChange }
}
