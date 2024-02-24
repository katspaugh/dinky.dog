import { Graph } from './components/Graph.js'
import { Node } from './components/Node.js'
import { Edge } from './components/Edge.js'

const REMOVE_THRESHOLD_X = -70
const REMOVE_THRESHOLD_Y = -20

let _graph = null
let _nodes = {}
let _edges = []
let _currentInput = null
let _currentOutput = null

let _isLocked = () => false

let _onClick = () => {}
let _onRemove = () => {}
let _onSelect = () => {}
let _onConnect = () => {}
let _onDisconnect = () => {}
let _onUpdate = () => {}

function onGraphClick(x, y) {
  if (_isLocked()) return
  _onClick(x, y)
}

function connectNodes(outputId, inputId, inputIndex) {
  const edge = Edge()

  const edgeContainer = edge.render({
    fromEl: _nodes[outputId].node.output,
    toEl: _nodes[inputId].node.inputs[inputIndex],
    onClick: () => {
      _edges = _edges.filter((e) => e !== edge)
      edge.destroy()
      _onDisconnect(outputId, inputId, inputIndex)
    },
  })

  _graph.render({ edge: edgeContainer })

  _edges.push({
    edge,
    outputId,
    inputId,
  })

  _onConnect(outputId, inputId, inputIndex)
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

  _onRemove(id)
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

    onClick: () => _onSelect(id),
    onDragEnd: (x, y) => _onUpdate(id, { x: Math.round(x), y: Math.round(y) }),
    onResizeEnd: (width, height) => _onUpdate(id, { width, height }),
    onBackgroundChange: (background) => _onUpdate(id, { background }),
  })

  _nodes[id] = {
    id: nodeProps.id,
    node,
  }

  _graph.render({ node: container })
}

function initGraph() {
  let clicked = false
  let mouseEdge = null

  const graph = Graph({
    onClick: (x, y) => {
      clicked = !clicked
      if (clicked) {
        onGraphClick(x, y)
      }

      if (mouseEdge) {
        mouseEdge.destroy()
        mouseEdge = null
        _currentInput = null
        _currentOutput = null
      }
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
        mouseEdge = Edge()
        graph.render({ edge: mouseEdge.container })
      }

      const fromEl = _currentOutput
        ? _nodes[_currentOutput.id].node.output
        : _nodes[_currentInput.id].node.inputs[_currentInput.index]

      mouseEdge.render({
        fromEl,
        toEl: { getBoundingClientRect: () => ({ left: x - 1, top: y - 1, width: 0, height: 0 }) },
      })
    },
  })

  return graph
}

export function initFlow(isLocked, callbacks) {
  _onClick = callbacks.onClick
  _onRemove = callbacks.onRemove
  _onSelect = callbacks.onSelect
  _onConnect = callbacks.onConnect
  _onDisconnect = callbacks.onDisconnect
  _onUpdate = callbacks.onUpdate

  _isLocked = isLocked

  _graph = initGraph()

  return {
    container: _graph.container,

    render: ({ node, edge }) => {
      if (node) {
        createNode(node)
      }
      if (edge) {
        connectNodes(edge.outputId, edge.inputId, edge.inputIndex)
      }
      return _graph.container
    },
  }
}
