import { useEffect } from 'https://esm.sh/preact/hooks'

export function useBeforeUnload(callback: () => void) {
  useEffect(() => {
    window.addEventListener('beforeunload', callback)
    return () => {
      window.removeEventListener('beforeunload', callback)
    }
  }, [callback])
}
