import { useCallback, useRef } from 'react'

export function usePassword(): [string, () => string] {
  const passwordRef = useRef('')

  const updatePassword = useCallback(() => {
    if (!passwordRef.current) {
      passwordRef.current = prompt('Enter password')
    }
    return passwordRef.current
  }, [passwordRef])

  return [
    passwordRef.current,
    updatePassword
  ]
}
