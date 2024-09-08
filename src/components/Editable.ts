import { useCallback, useMemo, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type EditableProps = {
  id: string
  content: string
  width?: number
  height?: number
  onChange: (content: string, height?: number) => void
}

const INITIAL_WIDTH = 170
const INITIAL_HEIGHT = 70.01

export const Editable = ({ id, content, onChange, width, height }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isManualHeight = height && height === Math.round(height)
  const [hasMinHeight, setHasMinHeight] = useState(!content && !isManualHeight)
  const minHeight = hasMinHeight ? height || INITIAL_HEIGHT : undefined

  const onInput = useCallback(
    (e) => {
      onChange(e.target.innerHTML, isManualHeight ? undefined : ref.current.offsetHeight + 0.01)
    },
    [onChange, isManualHeight],
  )

  const onBlur = useCallback(() => {
    if (content) {
      setHasMinHeight(false)
    }
  }, [content])

  const htmlContent = useMemo(() => ({ __html: content }), [content])

  return html`<div
    ref=${ref}
    id=${id}
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${onInput}
    onBlur=${onBlur}
    style="width: ${width || INITIAL_WIDTH}px; height: ${isManualHeight
      ? height
      : undefined}px; min-height: ${minHeight}px"
  />`
}
