import { useCallback, useEffect, useMemo, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type EditableProps = {
  id: string
  content: string
  width?: number
  height?: number
  onChange: (content: string, height?: number) => void
}

export const INITIAL_WIDTH = 150
export const INITIAL_HEIGHT = 70

export const Editable = ({ id, content, onChange, width, height }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isManualHeight = height && height === Math.round(height)
  const [hasMinHeight, setHasMinHeight] = useState(!content && !isManualHeight)

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

  useEffect(() => {
    if (!isManualHeight && ref.current) {
      onChange(content, ref.current.offsetHeight)
    }
  }, [ref, isManualHeight])

  return html`<div
    ref=${ref}
    id=${id}
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${onInput}
    onBlur=${onBlur}
    title=${height}
    style="
      width: ${width || INITIAL_WIDTH}px;
      height: ${isManualHeight ? height + 'px' : undefined};
      min-height: ${!isManualHeight && hasMinHeight ? INITIAL_HEIGHT + 'px' : undefined};
    "
  />`
}
