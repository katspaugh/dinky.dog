import { useCallback, useMemo, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type EditableProps = {
  id: string
  content: string
  width?: number
  height?: number
  onChange: (content: string, height?: number) => void
}

const INITIAL_HEIGHT = 70

export const Editable = ({ id, content, onChange, width, height }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const onInput = useCallback(
    (e) => {
      onChange(e.target.innerHTML, Math.min(ref.current.offsetHeight, INITIAL_HEIGHT))
    },
    [onChange],
  )

  const onBlur = useCallback(() => {
    if (content) {
      onChange(content, ref.current.offsetHeight)
    }
  }, [onChange, content])

  const htmlContent = useMemo(() => ({ __html: content }), [content])

  return html`<div
    ref=${ref}
    id=${id}
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${onInput}
    onBlur=${onBlur}
    style="width: ${width}px; min-height: ${height || INITIAL_HEIGHT}px;"
  />`
}
