import { useCallback, useMemo, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { DraggableNode } from './DraggableNode.js'
import { Edge } from './Edge.js'

type BoardProps = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
  onConnect: (from: string, to: string) => void
  onDisconnect: (from: string, to: string) => void
}

const WIDTH = 5000
const HEIGHT = 5000

export function Board(props: BoardProps) {
  const [tempFrom, setTempFrom] = useState<string | null>(null)
  const tempEdge = useMemo(
    () => (tempFrom ? { id: Math.random().toString(), fromNode: tempFrom, toNode: tempFrom } : null),
    [tempFrom],
  )

  const onConnectEnd = useCallback(
    (toNode: string) => {
      setTempFrom((oldFrom) => {
        if (oldFrom && oldFrom !== toNode) {
          props.onConnect(oldFrom, toNode)
        }
        return null
      })
    },
    [props.onConnect],
  )

  const renderNode = useCallback(
    (node: CanvasNode) => {
      return html`
        <${DraggableNode}
          ...${node}
          key=${node.id}
          onNodeUpdate=${props.onNodeUpdate}
          onConnectStart=${setTempFrom}
          onClick=${onConnectEnd}
        />
      `
    },
    [props.onNodeUpdate],
  )

  const renderEdge = useCallback(
    (edge: CanvasEdge) => {
      return html`<${Edge}
        key=${edge.id || edge.fromNode + edge.toNode}
        ...${edge}
        nodes=${props.nodes}
        onDisconnect=${props.onDisconnect}
      /> `
    },
    [props.nodes, props.onDisconnect],
  )

  return html`
    <div class="Board" style="width: ${WIDTH}px; height: ${HEIGHT}px;">
      ${props.nodes?.map(renderNode)}

      <svg viewBox="0 0 ${WIDTH} ${HEIGHT}">${props.edges?.map(renderEdge)} ${tempEdge && renderEdge(tempEdge)}</svg>
    </div>
  `
}
