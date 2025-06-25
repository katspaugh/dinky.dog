import { useCallback } from 'react'
import { Drop } from './Drop'

const UPLOADABLE_FILE_TYPES = /image\/.*/

export function ImageDrop({ onNodeCreate, onNodeDelete, onNodeUpdate, uploadImage, children }) {
  // Upload image
  const onFileDrop = useCallback(({ x, y, file }) => {
    const src = URL.createObjectURL(file)
    const node = onNodeCreate({ x, y, content: `<img src=${src} />` })

    uploadImage(file)
      .then((newSrc) => {
        URL.revokeObjectURL(src)
        onNodeUpdate(node.id, { content: `<img src=${newSrc} />` })
      })
      .catch((err) => {
        console.error('Error uploading image', err)
        URL.revokeObjectURL(src)
        onNodeDelete(node.id)
      })
  }, [onNodeCreate, onNodeUpdate, onNodeDelete, uploadImage])

  return (
    <Drop
      fileTypes={UPLOADABLE_FILE_TYPES}
      onFileDrop={onFileDrop}
    >
      {children}
    </Drop>
  )
}
