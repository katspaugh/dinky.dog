import { useCallback, useMemo, useRef } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type EditableProps = {
  content: string
  width?: number
  height?: number
  onChange: (content: string, height?: number) => void
}

const INITIAL_HEIGHT = 70

export const Editable = ({ content, onChange, width, height }: EditableProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const minHeight = content ? height : height || INITIAL_HEIGHT

  const onInput = useCallback(
    (e) => {
      onChange(e.target.innerHTML)
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
    class="Editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${onInput}
    onBlur=${onBlur}
    style="width: ${width}px; min-height: ${minHeight}px;"
  />`
}
