import { useEffect } from 'https://esm.sh/preact/hooks'

export function useOnKey(key: string, callback: () => void, deps?: any[]) {
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
