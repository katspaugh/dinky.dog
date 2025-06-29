import { createContext, useContext, ReactNode } from 'react'
import { useRealtimeDocState } from '../hooks/useRealtimeDocState.js'
import { useInitApp } from '../hooks/useInitApp.js'

const DocumentContext = createContext<ReturnType<typeof useInitApp> & ReturnType<typeof useRealtimeDocState> | null>(null)

export function DocumentProvider({ children }: { children: ReactNode }) {
  const realtimeState = useRealtimeDocState()
  const initState = useInitApp(realtimeState)

  return (
    <DocumentContext.Provider value={{ ...realtimeState, ...initState }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  const ctx = useContext(DocumentContext)
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider')
  return ctx
}
