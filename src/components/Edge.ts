import { useMemo } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import type { CanvasNode } from '../types/canvas.js'

type EdgeProps = {
  fromNode: string
  toNode: string
  nodes: CanvasNode[]
}

export const Edge = ({ fromNode, toNode, nodes }: EdgeProps) => {
  const from = useMemo(() => nodes.find((node) => node.id === fromNode), [fromNode, nodes])
  const to = useMemo(() => nodes.find((node) => node.id === toNode), [toNode, nodes])

  return html` <line x1=${from.x} y1=${from.y} x2=${to.x} y2=${to.y} stroke="black" /> `
}
