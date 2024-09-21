import { useCallback, useMemo, useState } from 'preact/hooks'
import type { CanvasEdge, CanvasNode } from '../types/canvas'
import { DraggableNode } from './DraggableNode.js'
import { Edge } from './Edge.js'
import { useMousePosition } from '../hooks/useMousePosition.js'
import { useOnKey } from '../hooks/useOnKey.js'
import { SelectionBox } from './SelectionBox.js'
import { INITIAL_HEIGHT, INITIAL_WIDTH } from './Editable.js'
import { ColorPicker } from './ColorPicker.js'

type BoardProps = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  backgroundColor?: string
  isLocked?: boolean
  onNodeCreate: (node: Partial<CanvasNode>) => CanvasNode
  onNodeDelete: (id: string) => void
  onNodeUpdate: (id: string, props: Partial<CanvasNode>) => void
  onConnect: (from: string, to: string) => void
  onDisconnect: (from: string, to: string) => void
  onBackgroundColorChange: (color: string) => void
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

  const onBackgroundColorChange = useCallback((color: string) => {
    props.onBackgroundColorChange(color)
  }, [props.onBackgroundColorChange])

  const onNodeClick = useCallback(
    (id: string) => {
      setTempFrom((oldFrom) => {
        if (oldFrom && oldFrom !== id) {
          props.onConnect(oldFrom, id)
        } else {
          setSelectedNodes([id])
        }
        return null
      })
    },
    [props.onConnect],
  )

  const onNodeCreate = useCallback((nodeProps?: Partial<CanvasNode>) => {
    const node = props.onNodeCreate({
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      ...nodeProps,
    })
    if (!node.content) {
      setTimeout(() => {
        document.getElementById(node.id)?.focus()
      }, 100)
    }
    return node
  }, [props.onNodeCreate, mousePosition.x, mousePosition.y])

  const onBoardClick = useCallback(() => {
    setSelectedNodes([])

    setTempFrom((oldFrom) => {
      if (oldFrom) {
        const node = onNodeCreate()
        props.onConnect(oldFrom, node.id)
      }
      return null
    })
  }, [props.onNodeCreate, props.onConnect, mousePosition.x, mousePosition.y])

  const onBoardDblClick = useCallback(() => {
    const node = onNodeCreate()
    setSelectedNodes([node.id])
  }, [mousePosition.x, mousePosition.y, props.onNodeCreate])

  const onNodeUpdate = useCallback((id: string, item: Partial<CanvasNode>) => {
    if ((item.x !== undefined || item.y !== undefined) && selectedNodes.length > 1) {
      const node = props.nodes.find((node) => node.id === id)
      const dx = item.x - node.x
      const dy = item.y - node.y

      selectedNodes.forEach((nodeId) => {
        const node = props.nodes.find((node) => node.id === nodeId)
        props.onNodeUpdate(nodeId, { x: Math.round(node.x + dx), y: Math.round(node.y + dy) })
      })
      return
    }
    props.onNodeUpdate(id, item)
  }, [props.nodes, props.onNodeUpdate, selectedNodes])

  const renderNode = useCallback(
    (node: CanvasNode) => {
      return (
        <DraggableNode
          {...node}
          key={node.id}
          onNodeUpdate={onNodeUpdate}
          onConnectStart={setTempFrom}
          onClick={onNodeClick}
          selected={selectedNodes.includes(node.id)}
        />
      )
    },
    [onNodeUpdate, selectedNodes],
  )

  const renderEdge = useCallback(
    (edge: CanvasEdge, _, __, toPosition?: { x: number; y: number }) => {
      return (
        <Edge
          key={edge.id || edge.fromNode + edge.toNode}
          {...edge}
          nodes={props.nodes}
          onDisconnect={props.onDisconnect}
          toPosition={toPosition}
        />
      )
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

  const sx = useMemo(() => ({ width: `${WIDTH}px`, height: `${HEIGHT}px` }), [])

  return (
    <div
      className={`Board${props.isLocked ? ' Board_locked' : ''}`}
      style={sx}
      onClick={onBoardClick}
      onDblClick={onBoardDblClick}
    >
      {props.nodes?.map(renderNode)}

      <svg viewBox="0 0 ${WIDTH} ${HEIGHT}">
        {props.edges?.map(renderEdge)} {tempEdge && renderEdge(tempEdge, undefined, undefined, mousePosition)}
      </svg>

      <SelectionBox onChange={onSelectionChange} />

      <ColorPicker color={props.backgroundColor} onColorChange={onBackgroundColorChange} />
    </div>
  )
}
