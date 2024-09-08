import { useCallback, useEffect, useMemo, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import type { CanvasNode } from '../types/canvas.js'

type EdgeProps = {
  fromNode: string
  toNode: string
  nodes: CanvasNode[]
  onDisconnect: (from: string, to: string) => void
}

const WIDTH = 170
const HEIGHT = 70

const useMousePosition = (isListening: boolean, initialPosition: { x: number; y: number }) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>()

  useEffect(() => {
    if (!isListening) return

    const onMouseMove = (e) => {
      const scrollX = document.body.scrollLeft
      const scrollY = document.body.scrollTop
      setMousePos({ x: e.clientX + scrollX, y: e.clientY + scrollY })
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isListening, initialPosition])

  return mousePos ?? initialPosition
}

export const Edge = ({ fromNode, toNode, nodes, onDisconnect }: EdgeProps) => {
  const from = useMemo(() => nodes.find((node) => node.id === fromNode), [fromNode, nodes])
  const to = useMemo(() => nodes.find((node) => node.id === toNode), [toNode, nodes])
  const isSameNode = fromNode === toNode

  const x1 = from.x + (from.width || WIDTH) / 2
  const y1 = from.y + (from.height || HEIGHT)
  const mousePos = useMousePosition(isSameNode, { x: x1, y: y1 })
  const x2 = isSameNode ? mousePos.x : to.x + (to.width || WIDTH) / 2
  const y2 = isSameNode ? mousePos.y : to.y

  /*
  // Bezier curve
  d=${`M ${x1} ${y1} C ${x1 + 100} ${y1} ${x2 - 100} ${y2} ${x2} ${y2}`}
   */

  const onClick = useCallback(() => {
    onDisconnect(fromNode, toNode)
  }, [fromNode, toNode, onDisconnect])

  // Straight line
  return html`<g class="Edge">
    <line x1=${x1} y1=${y1 + 2} x2=${x2} y2=${y2} onClick=${onClick} />
    <circle cx=${x2} cy=${y2} r="4" />
    <circle cx=${x1} cy=${y1 + 2} r="4" />
  </g>`
}
