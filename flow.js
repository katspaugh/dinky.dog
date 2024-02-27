import { Graph } from './components/Graph.js'
import { DropContainer } from './components/DropContainer.js'
import { Node, WIDTH, HEIGHT } from './components/Node.js'
import { Edge } from './components/Edge.js'

const REMOVE_THRESHOLD_X = -70
const REMOVE_THRESHOLD_Y = -20

let _graph = null
let _nodes = {}
let _edges = []
let _currentInput = null
let _currentOutput = null
let _callbacks = {}
let _isLocked = () => false

function connectNodes(outputId, inputId, inputIndex) {
  const edge = Edge()

  const edgeContainer = edge.render({
    fromEl: _nodes[outputId].node.output,
    toEl: _nodes[inputId].node.inputs[inputIndex],
    onClick: () => {
      if (_isLocked()) return
      _edges = _edges.filter((e) => e !== edge)
      edge.destroy()
      _callbacks.onDisconnect(outputId, inputId, inputIndex)
    },
  })

  _graph.render({ edge: edgeContainer })

  _edges.push({
    edge,
    outputId,
    inputId,
  })

  _callbacks.onConnect(outputId, inputId, inputIndex)
}

function onNodeConnect(outputId, inputId, inputIndex) {
  if (_isLocked()) return
  connectNodes(outputId, inputId, inputIndex)
}

function onNodeRemove(id) {
  if (_isLocked()) return

  const node = _nodes[id]
  if (!node) return
  const edges = _edges.filter((edge) => edge.outputId === id || edge.inputId === id)

  edges.forEach((edge) => {
    edge.edge.destroy()
  })

  node.node.destroy()

  delete _nodes[id]

  _callbacks.onRemove(id)
}

function updateEdges(id) {
  const edges = _edges.filter((edge) => edge.outputId === id || edge.inputId === id)
  edges.forEach((edge) => {
    edge.edge.render({})
  })
}

function createNode({ id, ...nodeProps }) {
  const node = Node()

  const onConnect = () => {
    onNodeConnect(_currentOutput.id, _currentInput.id, _currentInput.index)
    _currentOutput = null
    _currentInput = null
  }

  const container = node.render({
    ...nodeProps,

    isLocked: _isLocked,

    onInputClick: (index) => {
      _currentInput = { id, index }
      if (_currentOutput) {
        onConnect()
      }
    },

    onOutputClick: () => {
      _currentOutput = { id }
      if (_currentInput) {
        onConnect()
      }
    },

    onDrag: (x, y) => {
      updateEdges(id)

      if (x < REMOVE_THRESHOLD_X || y < REMOVE_THRESHOLD_Y) {
        onNodeRemove(id)
      }
    },

    onResize: () => {
      updateEdges(id)
    },

    onClick: () => _callbacks.onSelect(id),
    onDragEnd: (x, y) => _callbacks.onUpdate(id, { x: Math.round(x), y: Math.round(y) }),
    onResizeEnd: (width, height) => _callbacks.onUpdate(id, { width, height }),
    onBackgroundChange: (background) => _callbacks.onUpdate(id, { background }),
  })

  _nodes[id] = {
    id: nodeProps.id,
    node,
  }

  _graph.render({ node: container })

  // Immediately connect to the current input/output
  if (_currentOutput) {
    _currentInput = {
      id,
      index: 0,
    }
    onConnect()
  } else if (_currentInput) {
    _currentOutput = {
      id,
    }
    onConnect()
  }
}

function initGraph() {
  let mouseEdge = null

  const graph = Graph({
    onClick: (x, y) => {
      if (_isLocked()) return
      _callbacks.onClick(x, y)
    },

    onPointerMove: (x, y) => {
      if (_isLocked()) return

      const currentStart = _currentInput || _currentOutput
      if (!currentStart) {
        if (mouseEdge) {
          mouseEdge.destroy()
          mouseEdge = null
        }
        return
      }

      if (!mouseEdge) {
        mouseEdge = Edge({ inactive: true })
        graph.render({ edge: mouseEdge.container })
      }

      const start = _currentOutput
        ? _nodes[_currentOutput.id].node.output
        : _nodes[_currentInput.id].node.inputs[_currentInput.index]
      const end = { getBoundingClientRect: () => ({ left: x, top: y, width: 0, height: 0 }) }

      mouseEdge.render({ fromEl: _currentOutput ? start : end, toEl: _currentOutput ? end : start })
    },
    onPointerUp: () => {
      if (mouseEdge) {
        mouseEdge.destroy()
        mouseEdge = null
      }
    },
  })

  return graph
}

function initDropcontainer() {
  const drop = DropContainer()

  drop.render({
    fileTypes: /image\//,
    onDrop: (params) => {
      _callbacks.onDrop({
        ...params,
        x: params.x - WIDTH / 2,
        y: params.y - HEIGHT / 2,
      })
    },
  })

  return drop
}

export function initFlow(isLocked, callbacks) {
  _callbacks = callbacks
  _isLocked = isLocked

  _graph = initGraph()

  const drop = initDropcontainer()
  drop.container.appendChild(_graph.container)

  return {
    container: drop.container,

    render: ({ node, edge }) => {
      if (node) {
        createNode(node)
      }
      if (edge) {
        connectNodes(edge.outputId, edge.inputId, edge.inputIndex)
      }
      return drop.container
    },
  }
}
