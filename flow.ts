import { Component } from './utils/dom.js'
import { Graph } from './components/Graph.js'
import { DropContainer } from './components/DropContainer.js'
import { DinkyNode } from './components/DinkyNode.js'
import { Edge } from './components/Edge.js'
import { Colorwheel } from './components/Colorwheel.js'

type EdgeItem = {
  edge: ReturnType<typeof Edge>
  outputId: string
  inputId: string
}

let _graph: ReturnType<typeof Component>
let _nodes: Record<string, ReturnType<typeof DinkyNode>> = {}
let _edges: EdgeItem[] = []
let _currentOutput = null
let _callbacks: Record<string, (...args: any[]) => void> = {}

function resetCurrentConnections() {
  _currentOutput = null
}

function connectNodes(outputId, inputId) {
  const edge = Edge()

  const edgeItem = {
    edge,
    outputId,
    inputId,
  }

  _edges.push(edgeItem)

  const edgeContainer = edge.render({
    fromEl: _nodes[outputId].output,
    toEl: _nodes[inputId].input,
    onClick: () => _callbacks.onDisconnect(outputId, inputId),
  })

  _graph.render({ edge: edgeContainer })
}

function onNodeRemove(id) {
  const node = _nodes[id]
  if (!node) return

  const edges = _edges.filter((edge) => edge.outputId === id || edge.inputId === id)
  edges.forEach(removeEdge)

  node.destroy()
  delete _nodes[id]
}

const removeEdge = (edge) => {
  if (!edge) return
  edge.edge.destroy()
  _edges = _edges.filter((e) => e !== edge)
}

function updateEdges(id) {
  const edges = _edges.filter((edge) => edge.outputId === id || edge.inputId === id)
  edges.forEach((edge) => {
    edge.edge.render({})
  })
}

function renderPeerIndicator(id, clientId) {
  if (!clientId) return
  const node = _nodes[id]
  if (!node) return
  node.render({ clientId })
}

function renderNode({ id, clientId, ...nodeProps }) {
  if (_nodes[id]) {
    _nodes[id].render(nodeProps)
    renderPeerIndicator(id, clientId)
    return
  }

  const onConnect = (connectedId) => {
    _callbacks.onConnect(connectedId, id)
    resetCurrentConnections()
  }

  const node = DinkyNode(id, {
    onOutputClick: () => {
      _currentOutput = id
    },

    onDrag: (dx, dy) => {
      _callbacks.onDrag(id, dx, dy)
    },

    onResize: (dx, dy, width, height) => {
      _callbacks.onResize(id, dx, dy, width, height)
    },

    onResizeReset: () => {
      _callbacks.onResizeReset(id)
    },

    onBackgroundChange: (background) => {
      _callbacks.onBackgroundChange(id, background)
    },

    onClick: () => {
      if (_currentOutput) {
        onConnect(_currentOutput)
      } else {
        _callbacks.onUnselect()
        _callbacks.onSelect(id)
      }
    },
  })

  const container = node.render(nodeProps)
  _nodes[id] = node
  _graph.render({ node: container })

  // Immediately connect to the current input/output
  if (_currentOutput) {
    onConnect(_currentOutput)
  }

  renderPeerIndicator(id, clientId)
}

function initGraph(width, height) {
  let mouseEdge

  const resetMouseEdge = () => {
    if (mouseEdge) {
      mouseEdge.destroy()
      mouseEdge = undefined
    }
  }

  const graph = Graph({
    width,
    height,

    onClickAnywhere: () => {
      _callbacks.onUnselect()
    },

    onClick: (x, y) => {
      if (_currentOutput) {
        _callbacks.onEmptyClick(x, y)
      }
    },

    onDblClick: (x, y) => {
      _callbacks.onEmptyClick(x, y)
      resetCurrentConnections()
    },

    onPointerMove: (x, y) => {
      if (!_currentOutput) {
        resetMouseEdge()
        return
      }

      if (!mouseEdge) {
        mouseEdge = Edge({ inactive: true })
        graph.render({ edge: mouseEdge.container })
      }

      const fromEl = _nodes[_currentOutput].output
      const toEl = { getBoundingClientRect: () => ({ left: x, top: y, width: 0, height: 0 }) }

      mouseEdge.render({ fromEl, toEl })
    },

    onPointerUp: () => {
      resetMouseEdge()
    },

    onKeyDown: (e, isFocused) => {
      if (e.key === 'Escape') {
        resetMouseEdge()
        resetCurrentConnections()

        _callbacks.onDelete(isFocused)
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        _callbacks.onDelete(isFocused)
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (!isFocused) {
          _callbacks.onUndo()
        }
      }
    },

    onSelect: _callbacks.onSelectBox,
  })

  return graph
}

function initDropcontainer() {
  const drop = DropContainer({
    fileTypes: /image\//,
    onDrop: (params) => {
      _callbacks.onDrop({
        ...params,
        x: params.x - 80,
        y: params.y - 40,
      })
    },
  })

  return drop.render()
}

export function initFlow({ width, height, ...callbacks }) {
  _callbacks = callbacks

  _graph = initGraph(width, height)

  const dropContainer = initDropcontainer()

  const colorwheel = Colorwheel({
    onChange: callbacks.onMainBackgroundChange,
    style: {
      position: 'fixed',
      zIndex: '100',
      right: '10px',
      bottom: '10px',
    },
  })

  return Component({
    container: dropContainer,

    children: [_graph.container, colorwheel.render({ color: '#fffffa' })],

    render: ({ node, edge, backgroundColor, nodeToRemove, edgeToRemove }) => {
      if (node) {
        renderNode(node)
        updateEdges(node.id)
      }

      if (edge) {
        connectNodes(edge.outputId, edge.inputId)
      }

      if (nodeToRemove) {
        onNodeRemove(nodeToRemove)
      }

      if (edgeToRemove) {
        removeEdge(_edges.find((e) => e.outputId === edgeToRemove.outputId && e.inputId === edgeToRemove.inputId))
      }

      if (backgroundColor) {
        colorwheel.render({ color: backgroundColor })
        document.documentElement.style.backgroundColor = backgroundColor
      }
    },
  })
}
