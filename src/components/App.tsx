import { useSession } from '@supabase/auth-helpers-react'
import { AuthView } from './AuthView.js'
import { SpacesView } from './SpacesView.js'
import { EditorView } from './EditorView.js'
import { getUrlId } from '../lib/url.js'

export function App() {
  const session = useSession()
  const id = getUrlId()

  if (!session) {
    return <AuthView />
  }

  if (!id) {
    return <SpacesView />
  }

  return <EditorView />
}
