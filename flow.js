import { Graph } from './components/Graph.js'
import { DropContainer } from './components/DropContainer.js'
import { Node, WIDTH, HEIGHT } from './components/Node.js'
import { Edge } from './components/Edge.js'

let _graph = null
let _nodes = {}
let _edges = []
let _currentNode = null
let _currentInput = null
let _currentOutput = null
let _callbacks = {}

function connectNodes(outputId, inputId, inputIndex) {
  const edge = Edge()

  const edgeItem = {
    edge,
    outputId,
    inputId,
    inputIndex,
  }

  _edges.push(edgeItem)

  const edgeContainer = edge.render({
    fromEl: _nodes[outputId].output,
    toEl: _nodes[inputId].inputs[inputIndex],
    onClick: () => _callbacks.onDisconnect(outputId, inputId, inputIndex),
  })

  _graph.render({ edge: edgeContainer })
}

function onNodeConnect(outputId, inputId, inputIndex) {
  _callbacks.onConnect(outputId, inputId, inputIndex)
}

function onNodeRemove(id) {
  const node = _nodes[id]
  if (!node) return

  const edges = _edges.filter((edge) => edge.outputId === id || edge.inputId === id)
  edges.forEach((edge) => {
    edge.edge.destroy()
  })

  node.destroy()

  delete _nodes[id]

  _callbacks.onRemove(id)
}

const onEdgeRemove = (edge) => {
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

function renderNode({ id, ...nodeProps }) {
  if (_nodes[id]) {
    _nodes[id].render(nodeProps)
    return
  }

  const onConnect = () => {
    onNodeConnect(_currentOutput.id, _currentInput.id, _currentInput.index)
    _currentOutput = null
    _currentInput = null
  }

  const node = Node(id, {
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

    onDrag: (dx, dy) => {
      _callbacks.onDrag(id, dx, dy)
    },

    onResize: (dx, dy) => {
      _callbacks.onResize(id, dx, dy)
    },

    onBackgroundChange: (background) => {
      _callbacks.onBackgroundChange(id, background)
    },

    onClick: () => {
      _currentNode = id
      _callbacks.onSelect(id)
    },
  })

  const container = node.render(nodeProps)
  _nodes[id] = node
  _graph.render({ node: container })
  _currentNode = id

  // Immediately connect to the current input/output
  Promise.resolve().then(() => {
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
  })
}

function initGraph() {
  let mouseEdge = null

  const resetMouseEdge = () => {
    if (mouseEdge) {
      mouseEdge.destroy()
      mouseEdge = null
    }
  }

  const graph = Graph({
    onClick: (x, y) => {
      if (_currentOutput || _currentInput) {
        _callbacks.onEmptyClick(x, y)
      }
    },

    onDblClick: (x, y) => {
      _callbacks.onEmptyClick(x, y)
    },

    onPointerMove: (x, y) => {
      const currentStart = _currentInput || _currentOutput
      if (!currentStart) {
        resetMouseEdge()
        return
      }

      if (!mouseEdge) {
        mouseEdge = Edge({ inactive: true })
        graph.render({ edge: mouseEdge.container })
      }

      const start = _currentOutput
        ? _nodes[_currentOutput.id].output
        : _nodes[_currentInput.id].inputs[_currentInput.index]
      const end = { getBoundingClientRect: () => ({ left: x, top: y, width: 0, height: 0 }) }

      mouseEdge.render({ fromEl: _currentOutput ? start : end, toEl: _currentOutput ? end : start })
    },

    onPointerUp: () => {
      resetMouseEdge()
    },

    onKeyDown: (e) => {
      if (e.key === 'Escape') {
        resetMouseEdge()
        _currentInput = null
        _currentOutput = null

        if (_currentNode) {
          _callbacks.onEscape(_currentNode)
          _currentNode = null
        }
      }
    },
  })

  return graph
}

function initDropcontainer() {
  const drop = DropContainer({
    fileTypes: /image\//,
    onDrop: (params) => {
      _callbacks.onDrop({
        ...params,
        x: params.x - WIDTH / 2,
        y: params.y - HEIGHT / 2,
      })
    },
  })

  return drop.render()
}

export function initFlow(callbacks) {
  _callbacks = callbacks

  _graph = initGraph()

  const dropContainer = initDropcontainer()
  dropContainer.appendChild(_graph.container)

  return {
    container: dropContainer,

    render: ({ node, edge }) => {
      if (node) {
        renderNode(node)
        updateEdges(node.id)
      }
      if (edge) {
        connectNodes(edge.outputId, edge.inputId, edge.inputIndex)
      }
      return dropContainer
    },

    remove: ({ node, edge }) => {
      if (node) {
        onNodeRemove(node)
        updateEdges(node.id)
      }

      if (edge) {
        onEdgeRemove(
          _edges.find(
            (e) => e.outputId === edge.outputId && e.inputId === edge.inputId && e.inputIndex === edge.inputIndex,
          ),
        )
      }
    },
  }
}
