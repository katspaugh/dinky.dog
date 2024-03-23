import { Graph } from './components/Graph.js'
import { DropContainer } from './components/DropContainer.js'
import { Node } from './components/Node.js'
import { Edge } from './components/Edge.js'
import { Colorwheel } from './components/Colorwheel.js'

let _graph = null
let _nodes = {}
let _edges = []
let _currentNode = null
let _currentInput = null
let _currentOutput = null
let _callbacks = {}

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

  _callbacks.onRemove(id)
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

function renderNode({ id, ...nodeProps }) {
  if (_nodes[id]) {
    _nodes[id].render(nodeProps)
    return
  }

  const onConnect = () => {
    _callbacks.onConnect(_currentOutput || id, _currentInput || id)
    _currentOutput = null
    _currentInput = null
  }

  const node = Node(id, {
    onInputClick: () => {
      _currentInput = id
      if (_currentOutput) {
        onConnect()
      }
    },

    onOutputClick: () => {
      _currentOutput = id
      if (_currentInput) {
        onConnect()
      }
    },

    onDrag: (dx, dy) => {
      _callbacks.onDrag(id, dx, dy)
    },

    onResize: (dx, dy, width, height) => {
      _callbacks.onResize(id, dx, dy, width, height)
    },

    onBackgroundChange: (background) => {
      _callbacks.onBackgroundChange(id, background)
    },

    onClick: () => {
      if (_currentOutput || _currentInput) {
        onConnect()
      } else {
        _currentNode = id
        _callbacks.onSelect(id)
      }
    },
  })

  const container = node.render(nodeProps)
  _nodes[id] = node
  _graph.render({ node: container })
  _currentNode = id

  // Immediately connect to the current input/output
  if (_currentOutput || _currentInput) {
    onConnect()
  }
}

function initGraph(width, height) {
  let mouseEdge = null

  const resetMouseEdge = () => {
    if (mouseEdge) {
      mouseEdge.destroy()
      mouseEdge = null
    }
  }

  const graph = Graph({
    width,
    height,

    onClickAnywhere: () => {
      _currentNode = null
    },

    onClick: (x, y, wasFocused) => {
      if (_currentOutput || _currentOutput) {
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

      const start = _currentOutput ? _nodes[_currentOutput].output : _nodes[_currentInput].input
      const end = { getBoundingClientRect: () => ({ left: x, top: y, width: 0, height: 0 }) }

      mouseEdge.render({ fromEl: _currentOutput ? start : end, toEl: _currentOutput ? end : start })
    },

    onPointerUp: () => {
      resetMouseEdge()
    },

    onKeyDown: (e, isFocused) => {
      console.log(e.key)
      if (e.key === 'Escape') {
        resetMouseEdge()
        _currentOutput = null
        _currentInput = null

        if (_currentNode) {
          _callbacks.onEscapeKey(_currentNode)
          _currentNode = null
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (_currentNode) {
          _callbacks.onDeleteKey(_currentNode, isFocused)
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
  dropContainer.appendChild(_graph.container)

  const colorwheel = Colorwheel({ onChange: callbacks.onMainBackgroundChange })
  dropContainer.appendChild(colorwheel.container)

  Object.assign(colorwheel.container.style, {
    position: 'fixed',
    zIndex: 100,
    right: '10px',
    bottom: '10px',
  })

  return {
    container: dropContainer,

    render: ({ node, edge, backgroundColor }) => {
      if (node) {
        renderNode(node)
        updateEdges(node.id)
      }

      if (edge) {
        connectNodes(edge.outputId, edge.inputId)
      }

      if (backgroundColor) {
        colorwheel.render({ color: backgroundColor })
        dropContainer.style.backgroundColor = backgroundColor
      }

      return dropContainer
    },

    remove: ({ node, edge }) => {
      if (node) {
        onNodeRemove(node)
      }

      if (edge) {
        removeEdge(_edges.find((e) => e.outputId === edge.outputId && e.inputId === edge.inputId))
      }
    },
  }
}
