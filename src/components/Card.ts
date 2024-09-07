import { useMemo } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type CardProps = {
  width: number
  height: number
  color: string
  content: string
}

export function Card(props: CardProps) {
  const style = useMemo(
    () => ({
      width: `${props.width}px`,
      height: `${props.height}px`,
      backgroundColor: props.color,
    }),
    [props.width, props.height, props.color],
  )

  const htmlContent = useMemo(() => ({ __html: props.content }), [props.content])

  return html`<div class="card" style="${style}" dangerouslySetInnerHTML=${htmlContent}></div>`
}
