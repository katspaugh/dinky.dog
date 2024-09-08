import { useCallback } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'

type ConnectorProps = {
  onClick: () => void
}

export const Connector = ({ onClick }: ConnectorProps) => {
  const onButtonClick = useCallback(
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onClick()
    },
    [onClick],
  )
  return html`<button class="Connector" onClick=${onButtonClick} />`
}
