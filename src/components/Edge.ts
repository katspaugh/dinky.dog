import { useCallback, useMemo } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import type { CanvasNode } from '../types/canvas.js'
import { INITIAL_HEIGHT, INITIAL_WIDTH } from './Editable.js'

type EdgeProps = {
  fromNode: string
  toNode: string
  nodes: CanvasNode[]
  onDisconnect: (from: string, to: string) => void
  toPosition?: { x: number; y: number }
}

export const Edge = ({ fromNode, toNode, nodes, onDisconnect, toPosition }: EdgeProps) => {
  const from = useMemo(() => nodes.find((node) => node.id === fromNode), [fromNode, nodes])
  const to = useMemo(() => nodes.find((node) => node.id === toNode), [toNode, nodes])

  const x1 = from.x + (from.width || INITIAL_WIDTH) / 2
  const y1 = from.y + (from.height || INITIAL_HEIGHT)
  const x2 = toPosition ? toPosition.x : to.x + (to.width || INITIAL_WIDTH) / 2
  const y2 = toPosition ? toPosition.y : to.y

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
  </g>`
}
