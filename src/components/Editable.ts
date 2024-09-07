import { useCallback, useMemo, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type EditableProps = {
  content: string
  width?: number
  height?: number
  onChange: (content: string) => void
}

export const Editable = ({ content, onChange, width, height }: EditableProps) => {
  const [resetSize, setResetSize] = useState(false)

  const onInput = useCallback(
    (e) => {
      onChange(e.target.innerHTML)
    },
    [onChange],
  )

  const onBlur = useCallback(() => {
    if (content) {
      setResetSize(true)
    }
  }, [onChange, content])

  const htmlContent = useMemo(() => ({ __html: content }), [content])

  return html`<div
    class="editable"
    contenteditable
    dangerouslySetInnerHTML=${htmlContent}
    onInput=${onInput}
    onBlur=${onBlur}
    style="width: ${width}px; height: ${height}px; min-height: ${resetSize ? 'auto' : undefined};"
  />`
}
