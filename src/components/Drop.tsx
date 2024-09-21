import { useCallback, useState } from 'preact/hooks'
import { ComponentChildren } from 'preact'

type DropProps = {
  fileTypes: RegExp
  onFileDrop: ({ x, y, file }: { x: number; y: number; file: File }) => void
  children: ComponentChildren
}

export const Drop = ({ fileTypes, onFileDrop, children }: DropProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer?.files[0]
    if (file && fileTypes.test(file.type)) {
      const x = e.clientX + document.body.scrollLeft
      const y = e.clientY + document.body.scrollTop
      onFileDrop({ x, y, file })
    }

    setIsDragging(false)
  }, [fileTypes, onFileDrop])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  return (
    <div
      className={`Drop${isDragging ? ' Drop__dragover' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {children}
    </div>
  )
}
