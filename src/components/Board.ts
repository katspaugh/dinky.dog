import { useCallback } from 'https://esm.sh/preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { DraggableNode } from './DraggableNode.js'

type BoardProps = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
}

export function Board(props: BoardProps) {
  const renderNode = useCallback(
    (node: CanvasNode) => {
      return html`<${DraggableNode} ...${node} onNodeUpdate=${props.onNodeUpdate} />`
    },
    [props.onNodeUpdate],
  )

  return html`
    <div style="position: relative; width: 100vw; height: 100vh;">
      <div style="width: 5000px; height: 5000px;" class="board">${props.nodes?.map(renderNode)}</div>
    </div>
  `
}
