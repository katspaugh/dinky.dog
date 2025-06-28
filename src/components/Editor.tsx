import { Board } from './Board.js'
import { Sidebar } from './Sidebar.js'
import { uploadImage } from '../lib/upload-image.js'
import { useRealtimeDocState } from '../hooks/useRealtimeDocState.js'
import { ImageDrop } from './ImageDrop.js'
import { useInitApp } from '../hooks/useInitApp.js'

export function Editor() {
  const state = useRealtimeDocState()
  const { doc, onNodeCreate, onNodeDelete, onNodeUpdate, onConnect, onDisconnect, onBackgroundColorChange, onTitleChange } = state
  const { isLocked, onFork } = useInitApp(state)

  return (
    <ImageDrop
      onNodeCreate={onNodeCreate}
      onNodeDelete={onNodeDelete}
      onNodeUpdate={onNodeUpdate}
      uploadImage={uploadImage}
    >
      <Board
        {...doc}
        isLocked={isLocked}
        onNodeCreate={onNodeCreate}
        onNodeDelete={onNodeDelete}
        onNodeUpdate={onNodeUpdate}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onBackgroundColorChange={onBackgroundColorChange}
      />

      <Sidebar
        onFork={onFork}
        onTitleChange={onTitleChange}
        isLocked={isLocked}
        title={doc.title}
      />
    </ImageDrop>
  )
}
