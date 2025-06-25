import { Board } from './Board.js'
import { Sidebar } from './Sidebar.js'
import { uploadImage } from '../lib/upload-image.js'
import { useDocState } from '../hooks/useDocState.js'
import { ImageDrop } from './ImageDrop.js'
import { useInitApp } from '../hooks/useInitApp.js'
import { useSession } from '@supabase/auth-helpers-react'
import { Auth } from './Auth.js'

export function App() {
  const session = useSession()
  const state = useDocState()
  const { doc, onNodeCreate, onNodeDelete, onNodeUpdate, onConnect, onDisconnect, onBackgroundColorChange } = state
  const { onLockChange, onTitleChange } = useInitApp(state)

  if (!session) {
    return <Auth />
  }

  return (
    <ImageDrop
      onNodeCreate={onNodeCreate}
      onNodeDelete={onNodeDelete}
      onNodeUpdate={onNodeUpdate}
      uploadImage={uploadImage}
    >
      <Board
        {...doc}
        onNodeCreate={onNodeCreate}
        onNodeDelete={onNodeDelete}
        onNodeUpdate={onNodeUpdate}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onBackgroundColorChange={onBackgroundColorChange}
      />

      <Sidebar
        onLockChange={onLockChange}
        onTitleChange={onTitleChange}
        isLocked={doc.isLocked}
        title={doc.title}
      />
    </ImageDrop>
  )
}
