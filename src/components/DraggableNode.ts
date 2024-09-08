import { useCallback, useEffect, useRef, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { draggable } from '../lib/draggable.js'
import { Card } from './Card.js'
import { Connector } from './Connector.js'

type DraggableNodeProps = CanvasNode & {
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
  onConnectStart: (fromNode: string) => void
  onClick: (id: string) => void
}

const BG_THRESHOLD = 110e3

export function DraggableNode(props: DraggableNodeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: props.x, y: props.y })
  const isBackgroundCard = props.color && props.width * props.height > BG_THRESHOLD

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

  const onContentChange = useCallback(
    (content: string, height?: number) => {
      props.onNodeUpdate(props.id, { content, height })
    },
    [props.id, props.onNodeUpdate],
  )

  const onConnectStart = useCallback(() => {
    props.onConnectStart(props.id)
  }, [props.id, props.onNodeUpdate])

  const onClick = useCallback(() => {
    props.onClick(props.id)
  }, [props.id, props.onClick])

  useEffect(() => {
    setPosition({ x: props.x, y: props.y })
  }, [props.x, props.y])

  useEffect(() => {
    if (!ref.current) return
    return draggable(ref.current, onDrag)
  }, [ref, onDrag])

  return html`<div
    class="DraggableNode"
    style="transform: translate(${position.x}px, ${position.y}px);
      z-index: ${isBackgroundCard ? 1 : undefined};
      opacity: ${isBackgroundCard ? 0.75 : undefined};"
    ref=${ref}
    onClick=${onClick}
  >
    <${Card}
      id=${props.id}
      content=${props.content}
      color=${props.color}
      width=${props.width}
      height=${props.height}
      onContentChange=${onContentChange}
    />

    <${Connector} onClick=${onConnectStart} />
  </div>`
}
