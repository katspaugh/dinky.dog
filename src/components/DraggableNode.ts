import { useCallback, useEffect, useRef, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { draggable } from '../lib/draggable.js'
import { Card } from './Card.js'

type DraggableNodeProps = CanvasNode & { onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void }

export function DraggableNode(props: DraggableNodeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: props.x, y: props.y })

  const onDrag = useCallback(
    (dx: number, dy: number) => {
      setPosition((pos) => {
        const newPosition = { x: Math.round(pos.x + dx), y: Math.round(pos.y + dy) }
        props.onNodeUpdate(props.id, newPosition)
        return newPosition
      })
    },
    [props.onNodeUpdate],
  )

  useEffect(() => {
    setPosition({ x: props.x, y: props.y })
  }, [props.x, props.y])

  useEffect(() => {
    if (!ref.current) return
    return draggable(ref.current, onDrag)
  }, [ref, onDrag])

  return html`<div style="transform: translate(${position.x}px, ${position.y}px" ref=${ref}>
    <${Card} content=${props.content} color=${props.color} width=${props.width} height=${props.height} />
  </div>`
}
