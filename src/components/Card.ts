import { html } from '../lib/html.js'
import { Editable } from './Editable.js'

type CardProps = {
  id: string
  width: number
  height: number
  color: string
  content: string
  onContentChange: (content: string) => void
  onHeightChange: (height: number) => void
}

export function Card(props: CardProps) {
  return html`<div class="Card" style="background-color: ${props.color}">
    <${Editable}
      id=${props.id}
      content=${props.content}
      width=${props.width}
      height=${props.height}
      onChange=${props.onContentChange}
      onHeightChange=${props.onHeightChange}
    />
  </div>`
}
