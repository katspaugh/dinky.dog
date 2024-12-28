import { useEffect } from 'react'

export function useOnKey(key: string, callback: () => void, deps = []) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [key, callback, ...deps])
}
