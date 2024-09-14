import { useCallback, useEffect, useRef, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { draggable } from '../lib/draggable.js'
import { Card } from './Card.js'
import { Connector } from './Connector.js'
import { Resizer } from './Resizer.js'
import { INITIAL_HEIGHT, INITIAL_WIDTH } from './Editable.js'

type DraggableNodeProps = CanvasNode & {
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
  onConnectStart: (fromNode: string) => void
  onClick: (id: string) => void
  selected: boolean
}

const BG_THRESHOLD = 110e3

const stopPropagation = (e) => e.stopPropagation()

export function DraggableNode(props: DraggableNodeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: props.x, y: props.y })
  const [size, setSize] = useState({ width: props.width ?? 0, height: props.height ?? 0 })
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

  const onContentChange = useCallback((content: string) => {
    props.onNodeUpdate(props.id, { content })
  }, [props.id, props.onNodeUpdate])

  const onHeightChange = useCallback((height: number) => {
    props.onNodeUpdate(props.id, { height })
  }, [props.id, props.onNodeUpdate])

  const onConnectStart = useCallback(() => {
    props.onConnectStart(props.id)
  }, [props.id, props.onNodeUpdate])

  const onClick = useCallback(() => {
    props.onClick(props.id)
  }, [props.id, props.onClick])

  const onResize = useCallback(
    (dx: number, dy: number) => {
      setSize((oldSize) => {
        const newSize = {
          width: Math.round((oldSize.width || INITIAL_WIDTH) + dx),
          height: Math.round((oldSize.height || INITIAL_HEIGHT) + dy),
        }
        props.onNodeUpdate(props.id, newSize)
        return newSize
      })
    },
    [props.id, props.onNodeUpdate],
  )

  useEffect(() => {
    setPosition({ x: props.x, y: props.y })
  }, [props.x, props.y])

  useEffect(() => {
    if (!ref.current) return
    return draggable(ref.current, onDrag)
  }, [ref, onDrag])

  return html`<div
    class=${`DraggableNode${props.selected ? ' DraggableNode_selected' : ''}`}
    style="transform: translate(${position.x}px, ${position.y}px);
      z-index: ${isBackgroundCard ? 1 : undefined};
      opacity: ${isBackgroundCard ? 0.75 : undefined};"
    ref=${ref}
    onClick=${onClick}
    onDblClick=${stopPropagation}
  >
    <${Card}
      id=${props.id}
      content=${props.content}
      color=${props.color}
      width=${size.width}
      height=${size.height}
      onContentChange=${onContentChange}
      onHeightChange=${onHeightChange}
    />

    <${Connector} onClick=${onConnectStart} />

    <${Resizer} onResize=${onResize} />
  </div>`
}
