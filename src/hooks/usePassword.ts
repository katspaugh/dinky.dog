import { useCallback, useEffect, useRef } from 'react'
import { loadFromLocalStorage } from '../lib/persist'

export function usePassword(id?: string): [string, () => string] {
  const passwordRef = useRef('')

  const updatePassword = useCallback(() => {
    if (!passwordRef.current) {
      passwordRef.current = prompt('Enter password')
    }
    return passwordRef.current
  }, [passwordRef])

  useEffect(() => {
    if (!id) return
    passwordRef.current = loadFromLocalStorage(id)?.password
  }, [id])

  return [
    passwordRef.current,
    updatePassword
  ]
}
