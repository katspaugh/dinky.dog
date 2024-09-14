import { useCallback, useEffect, useMemo, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'

type EditableProps = {
  id: string
  content: string
  width?: number
  height?: number
  onChange: (content: string) => void
  onHeightChange: (height: number) => void
}

export const INITIAL_WIDTH = 150
export const INITIAL_HEIGHT = 70

export const Editable = ({ id, content, width, height, onChange, onHeightChange }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isManualHeight = height && height === Math.round(height)
  const [hasMinHeight, setHasMinHeight] = useState(!content && !isManualHeight)

  const updateHeight = useCallback(() => {
    if (isManualHeight) return
    onHeightChange(ref.current.offsetHeight + 0.01)
  }, [onHeightChange, isManualHeight])

  const onBlur = useCallback((e) => {
    const { innerHTML = '' } = e.target
    setHasMinHeight(false)
    onChange(sanitizeHtml(innerHTML))
    const timeout = setTimeout(updateHeight, 100)
    return () => clearTimeout(timeout)
  }, [ref, onChange, updateHeight])

  const htmlContent = useMemo(() => ({ __html: sanitizeHtml(content) }), [content])

  useEffect(() => {
    if (!isManualHeight && ref.current) {
      onHeightChange(ref.current.offsetHeight + 0.01)
    }
  }, [ref, isManualHeight, onHeightChange])

  return html`<div
    ref=${ref}
    id=${id}
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${updateHeight}
    onBlur=${onBlur}
    title=${height}
    style="
      width: ${width || INITIAL_WIDTH}px;
      height: ${isManualHeight ? height + 'px' : undefined};
      min-height: ${!isManualHeight && hasMinHeight ? INITIAL_HEIGHT + 'px' : undefined};
    "
  />`
}
