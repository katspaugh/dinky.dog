import { useCallback, useMemo, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { DraggableNode } from './DraggableNode.js'
import { Edge } from './Edge.js'
import { useMousePosition } from '../hooks/useMousePosition.js'
import { useOnKey } from '../hooks/useOnKey.js'

type BoardProps = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodeCreate: (node: Partial<CanvasNode>) => CanvasNode
  onNodeDelete: (id: string) => void
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
  onConnect: (from: string, to: string) => void
  onDisconnect: (from: string, to: string) => void
}

const WIDTH = 5000
const HEIGHT = 5000

export function Board(props: BoardProps) {
  const [tempFrom, setTempFrom] = useState<string | null>(null)
  const [, setCurrentNode] = useState<string | null>(null)
  const mousePosition = useMousePosition()

  const tempEdge = useMemo(
    () => (tempFrom ? { id: Math.random().toString(), fromNode: tempFrom, toNode: tempFrom } : null),
    [tempFrom],
  )

  const onNodeClick = useCallback(
    (id: string) => {
      setTempFrom((oldFrom) => {
        if (oldFrom && oldFrom !== id) {
          props.onConnect(oldFrom, id)
        }
        return null
      })
      setCurrentNode(id)
    },
    [props.onConnect],
  )

  const onBoardClick = useCallback(() => {
    setTempFrom((oldFrom) => {
      if (oldFrom) {
        const node = props.onNodeCreate({
          x: mousePosition.x - 10,
          y: mousePosition.y - 10,
        })
        props.onConnect(oldFrom, node.id)
      }
      return null
    })
  }, [props.onNodeCreate, props.onConnect, mousePosition.x, mousePosition.y])

  const onBoardDblClick = useCallback(() => {
    const node = props.onNodeCreate({
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
    })
    setCurrentNode(node.id)
  }, [mousePosition.x, mousePosition.y, props.onNodeCreate])

  const renderNode = useCallback(
    (node: CanvasNode) => {
      return html`
        <${DraggableNode}
          ...${node}
          key=${node.id}
          onNodeUpdate=${props.onNodeUpdate}
          onConnectStart=${setTempFrom}
          onClick=${onNodeClick}
        />
      `
    },
    [props.onNodeUpdate],
  )

  const renderEdge = useCallback(
    (edge: CanvasEdge, _, __, toPosition?: { x: number; y: number }) => {
      return html`<${Edge}
        key=${edge.id || edge.fromNode + edge.toNode}
        ...${edge}
        nodes=${props.nodes}
        onDisconnect=${props.onDisconnect}
        toPosition=${toPosition}
      /> `
    },
    [props.nodes, props.onDisconnect],
  )

  useOnKey(
    'Escape',
    () => {
      setTempFrom(null)

      setCurrentNode((oldNode) => {
        if (oldNode && confirm('Delete card?')) {
          props.onNodeDelete(oldNode)
          return null
        }
        return oldNode
      })
    },
    [],
  )

  return html`
    <div
      class="Board"
      style="width: ${WIDTH}px; height: ${HEIGHT}px;"
      onClick=${onBoardClick}
      onDblClick=${onBoardDblClick}
    >
      ${props.nodes?.map(renderNode)}

      <svg viewBox="0 0 ${WIDTH} ${HEIGHT}">
        ${props.edges?.map(renderEdge)} ${tempEdge && renderEdge(tempEdge, undefined, undefined, mousePosition)}
      </svg>
    </div>
  `
}
