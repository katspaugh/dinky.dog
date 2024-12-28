import { useEffect } from 'react'

export function useBeforeUnload(callback: () => void) {
  useEffect(() => {
    window.addEventListener('beforeunload', callback)
    return () => {
      window.removeEventListener('beforeunload', callback)
    }
  }, [callback])
}
