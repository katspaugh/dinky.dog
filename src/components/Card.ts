import { html } from '../lib/html.js'
import { Editable } from './Editable.js'

type CardProps = {
  width: number
  height: number
  color: string
  content: string
}

export function Card(props: CardProps) {
  return html`<div class="card" style="background-color: ${props.color}">
    <${Editable} content=${props.content} width=${props.width} height=${props.height} />
  </div>`
}
