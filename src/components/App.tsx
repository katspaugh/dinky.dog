import { useSession } from '@supabase/auth-helpers-react'
import { Auth } from './Auth.js'
import { Spaces } from './Spaces.js'
import { Editor } from './Editor.js'
import { getUrlId } from '../lib/url.js'

export function App() {
  const session = useSession()
  const id = getUrlId()

  if (!session) {
    return <Auth />
  }

  if (!id) {
    return <Spaces />
  }

  return <Editor />
}
