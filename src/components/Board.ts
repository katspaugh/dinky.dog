import { useCallback } from 'https://esm.sh/preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { DraggableNode } from './DraggableNode.js'
import { Edge } from './Edge.js'

type BoardProps = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
}

const WIDTH = 5000
const HEIGHT = 5000

export function Board(props: BoardProps) {
  const renderNode = useCallback(
    (node: CanvasNode) => {
      return html`<${DraggableNode} ...${node} onNodeUpdate=${props.onNodeUpdate} key=${node.id} />`
    },
    [props.onNodeUpdate],
  )

  return html`
    <div class="Board">
      <div style="width: ${WIDTH}px; height: ${HEIGHT}px;">
        ${props.nodes?.map(renderNode)}

        <svg viewBox="0 0 ${WIDTH} ${HEIGHT}">
          ${props.edges?.map((edge) => html`<${Edge} key=${edge.id} ...${edge} nodes=${props.nodes} />`)}
        </svg>
      </div>
    </div>
  `
}
