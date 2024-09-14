import { useCallback, useMemo, useState } from 'https://esm.sh/preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { html } from '../lib/html.js'
import { DraggableNode } from './DraggableNode.js'
import { Edge } from './Edge.js'
import { useMousePosition } from '../hooks/useMousePosition.js'
import { useOnKey } from '../hooks/useOnKey.js'
import { SelectionBox } from './SelectionBox.js'
import { INITIAL_HEIGHT, INITIAL_WIDTH } from './Editable.js'

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
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
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
        } else {
          setTimeout(() => setSelectedNodes([id]), 0)
        }
        return null
      })
    },
    [props.onConnect],
  )

  const onBoardClick = useCallback(() => {
    setSelectedNodes([])

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
    setSelectedNodes([node.id])
  }, [mousePosition.x, mousePosition.y, props.onNodeCreate])

  const onNodeUpdate = useCallback((id: string, item: Partial<CanvasNode>) => {
    if (item.x !== undefined || item.y !== undefined) {
      const node = props.nodes.find((node) => node.id === id)
      const dx = item.x - node.x
      const dy = item.y - node.y
      props.onNodeUpdate(id, item)

      if (selectedNodes.length > 1) {
        selectedNodes.filter((nodeId) => nodeId !== id).forEach((nodeId) => {
          const node = props.nodes.find((node) => node.id === nodeId)
          props.onNodeUpdate(nodeId, { x: node.x + dx, y: node.y + dy })
        })
      }
    }
  }, [props.nodes, props.onNodeUpdate, selectedNodes])

  const renderNode = useCallback(
    (node: CanvasNode) => {
      return html`
        <${DraggableNode}
          ...${node}
          key=${node.id}
          onNodeUpdate=${onNodeUpdate}
          onConnectStart=${setTempFrom}
          onClick=${onNodeClick}
          selected=${selectedNodes.includes(node.id)}
        />
      `
    },
    [onNodeUpdate, selectedNodes],
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

  const onSelectionChange = useCallback((box: { x1: number, y1: number, x2: number, y2: number }) => {
    const nodes = props.nodes.filter((node) => {
      const { width = INITIAL_WIDTH, height = INITIAL_HEIGHT } = node
      const isOverlapping = (node.x >= box.x1 && node.x + width <= box.x2 && node.y >= box.y1 && node.y + height <= box.y2) ||
        (node.x <= box.x2 && node.x + width >= box.x1 && node.y <= box.y2 && node.y + height >= box.y1)
      return isOverlapping
    })
    setSelectedNodes(nodes.map((node) => node.id))
  }, [props.nodes])

  useOnKey(
    'Escape',
    () => {
      setTempFrom(null)

      setSelectedNodes((oldNodes) => {
        if (oldNodes?.length && confirm(`Delete ${oldNodes.length === 1 ? 'this card' : oldNodes.length + ' cards'}?`)) {
          oldNodes.forEach(props.onNodeDelete)
          return []
        }
        return oldNodes
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

      <${SelectionBox} onChange=${onSelectionChange} />
    </div>
  `
}
