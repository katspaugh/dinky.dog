import { useCallback, useMemo } from 'react'
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

  const x1 = from.x + (from.width || INITIAL_WIDTH)
  const y1 = from.y + (from.height || INITIAL_HEIGHT) / 2
  let x2 = toPosition ? toPosition.x : to.x
  let y2 = toPosition ? toPosition.y : to.y + (to.height || INITIAL_HEIGHT) / 2
  const minYDistance = (from.height || INITIAL_HEIGHT)

  // If the nodes are more one under the other than one next to each other, we want to draw the edge vertically
  // from the bottom of the from node to the top of the to node
  const isVertical = (y2 - y1 > minYDistance) && (x2 < x1)
  if (isVertical && !toPosition) {
    x2 = to.x + (to.width || INITIAL_WIDTH) / 2
    y2 = to.y
  }

  const onClick = useCallback(() => {
    onDisconnect(fromNode, toNode)
  }, [fromNode, toNode, onDisconnect])

  return (
    <g className="Edge">
      <path d={`M ${x1} ${y1} C ${x1 + 100} ${y1} ${x2 - (isVertical ? 30 : 100)} ${y2} ${x2} ${y2}`} onClick={onClick} />
      <circle cx={x1} cy={y1} r="4" />
      <circle cx={x2} cy={y2} r="4" />
    </g>
  )
}
