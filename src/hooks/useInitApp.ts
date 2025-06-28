import { useCallback, useEffect, useMemo, useRef } from 'react'
import { getUrlId, setUrlId } from '../lib/url'
import { loadDoc, saveDoc } from '../lib/dinky-api'
import { useBeforeUnload } from './useBeforeUnload'
import { randomId } from '../lib/utils'
import { type useDocState } from './useDocState'
import { useSession } from '@supabase/auth-helpers-react'

const TITLE = 'SpaceNotes'

export function useInitApp(state: ReturnType<typeof useDocState>) {
  const { doc, setDoc } = state
  const stringDoc = useMemo(() => JSON.stringify(doc), [doc])
  const originalDoc = useRef(stringDoc)
  // Init user session
  const session = useSession()
  const userId = session?.user?.id || ''
  const isLocked = doc.userId !== userId

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
      setDoc((prevDoc) => ({ ...prevDoc, id: newId }))
      setUrlId(newId)
    }
  }, [setDoc])

  // Save doc on unload
  useBeforeUnload(useCallback(() => {
    if (!userId) return
    setDoc((prevDoc) => {
      if ((prevDoc.userId === userId) && prevDoc.id && prevDoc.title && JSON.stringify(prevDoc) !== originalDoc.current) {
        saveDoc(prevDoc, userId)
      }
      return prevDoc
    })
  }, [setDoc, userId]))

  // Update title
  useEffect(() => {
    document.title = doc?.title ? `${TITLE} — ${doc.title}` : TITLE
  }, [doc?.title])

  // Update background color
  useEffect(() => {
    document.body.style.backgroundColor = doc?.backgroundColor ?? ''
  }, [doc?.backgroundColor])

  // Fork current space
  const onFork = useCallback(() => {
    if (!userId) return

    setDoc((prevDoc) => {
      const newDoc = { ...prevDoc, userId }

      saveDoc(newDoc, userId)
        .then(() => {
          originalDoc.current = JSON.stringify(newDoc)
        })
        .catch((err) => console.error('Error saving doc', err))

      setUrlId(newDoc.id, newDoc.title)

      return newDoc
    })
  }, [setDoc, userId])

  // On title change handler
  const onTitleChange = useCallback((title: string) => {
    setDoc((doc) => ({ ...doc, title }))
  }, [setDoc])

  return { onFork, onTitleChange, isLocked }
}
