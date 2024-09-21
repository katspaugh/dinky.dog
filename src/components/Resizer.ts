import { useEffect, useRef } from 'https://esm.sh/preact/hooks'
import { html } from 'https://esm.sh/htm/preact'
import { draggable } from '../lib/draggable.js'

type ResizerProps = {
  onResize: (width: number, height: number) => void
}

export function Resizer({ onResize }: ResizerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return draggable(ref.current, onResize)
  }, [ref, onResize])

  return html`<div class="Resizer" ref=${ref} />`
}
