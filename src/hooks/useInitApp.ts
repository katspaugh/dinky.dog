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

  // Load doc from URL
  useEffect(() => {
    const id = getUrlId()

    if (id) {
      setDoc((prevDoc) => {
        if (prevDoc.id !== id) {
          loadDoc(id)
            .then((newDoc) => {
              console.log('Loaded doc', id, newDoc)
              const docOwner = newDoc.user_id
              const docData = { ...newDoc } as typeof newDoc & { creator?: unknown; user_id?: unknown }
              delete (docData as { creator?: unknown }).creator
              delete (docData as { user_id?: unknown }).user_id
              const locked = !!docOwner && docOwner !== userId
              originalDoc.current = JSON.stringify(newDoc)
              setDoc({ ...docData, isLocked: locked })
              setUrlId(newDoc.id, newDoc.title)
            })
            .catch((err) => console.error('Error loading doc', err))
          return { ...prevDoc, id }
        }
        return prevDoc
      })
    } else {
      const newId = randomId()
      setDoc((newDoc) => ({ ...newDoc, id: newId, isLocked: false }))
      setUrlId(newId)
    }
  }, [setDoc])

  // Save doc on unload
  useBeforeUnload(useCallback(() => {
    if (!userId) return
    setDoc((doc) => {
      if (doc.id && doc.title && JSON.stringify(doc) !== originalDoc.current) {
        const cleanDoc = { ...doc } as typeof doc & { isLocked?: unknown; creator?: unknown; user_id?: unknown }
        delete cleanDoc.isLocked
        delete (cleanDoc as { creator?: unknown }).creator
        delete (cleanDoc as { user_id?: unknown }).user_id
        saveDoc(cleanDoc as typeof doc, userId)
      }
      return doc
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

    const docToFork = { ...doc } as typeof doc & { creator?: unknown; user_id?: unknown }
    delete (docToFork as { creator?: unknown }).creator
    delete (docToFork as { user_id?: unknown }).user_id
    const newDoc = { ...docToFork, id: randomId(), isLocked: false } as typeof doc
    const cleanDoc = { ...newDoc } as typeof newDoc & { isLocked?: unknown; creator?: unknown; user_id?: unknown }
    delete cleanDoc.isLocked
    delete (cleanDoc as { creator?: unknown }).creator
    delete (cleanDoc as { user_id?: unknown }).user_id
    saveDoc(cleanDoc as typeof newDoc, userId)
      .then(() => {
        originalDoc.current = JSON.stringify(newDoc)
        setUrlId(newDoc.id, newDoc.title)
      })
      .catch((err) => console.error('Error saving doc', err))
    setDoc(newDoc)
  }, [doc, setDoc, userId])

  // On title change handler
  const onTitleChange = useCallback((title: string) => {
    setDoc((doc) => ({ ...doc, title }))
  }, [setDoc])

  return { onFork, onTitleChange }
}
