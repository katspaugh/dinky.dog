import { useSession } from '@supabase/auth-helpers-react'
import { AuthPage } from '../pages/AuthPage.js'
import { SpacesPage } from '../pages/SpacesPage.js'
import { EditorPage } from '../pages/EditorPage.js'
import { getUrlId } from '../lib/url.js'

export function App() {
  const session = useSession()
  const id = getUrlId()

  if (id) {
    return <EditorPage />
  }

  if (session && !id) {
    return <SpacesPage />
  }

  return <AuthPage />
}
