import { Sidebar } from './components/Sidebar.js'
import { DropContainer } from './components/DropContainer.js'
import { initFlow } from './flow.js'
import * as Operators from './operators/index.js'
import { saveState, loadState } from './persist.js'
import { debounce } from './utils/debounce.js'

let _isLocked = false
let _sidebar = null
let _graph = null
let _nodes = {}

const persist = debounce(() => {
  const nodes = Object.entries(_nodes).reduce((acc, [id, node]) => {
    acc[id] = {
      props: node.props,
      data: {
        ...node.data,
        operatorData: node.operator.serialize(),
      },
      connections: node.connections,
    }
    return acc
  }, {})
  saveState({ nodes, isLocked: _isLocked })
}, 500)

function randomId() {
  return Math.random().toString(32).slice(2)
}

function createNode(id, props, data) {
  const operator = Operators[data.operatorType](data.operatorData)

  _nodes[id] = {
    props,
    data,
    operator,
    connections: [],
  }

  _graph.render({
    node: {
      ...props,
      id,
      inputsCount: operator.inputs.length,
      children: operator.render(),
    },
  })

  operator.output.subscribe(() => {
    persist()
  })

  persist()
}

function connectNodes(outputId, inputId, inputIndex) {
  _graph.render({
    edge: {
      outputId,
      inputId,
      inputIndex,
    },
  })
}

function onClick(x, y) {
  const id = randomId()
  createNode(id, { x, y }, { operatorType: Operators.Text.name })
}

function onDrop({ x, y, fileType, data }) {
  const id = randomId() + fileType
  createNode(id, { x, y }, { operatorType: Operators.Image.name, operatorData: data })
}

function onRemove(id) {
  delete _nodes[id]
  persist()
}

function onSelect(id) {
  const node = _nodes[id]
  if (!node) return

  _sidebar.render({
    description: node.operator.serialize(),
    note: node.data.note,
    onNoteEdit: (value) => {
      node.data.note = value
      persist()
    },
  })
}

function onConnect(outputId, inputId, inputIndex) {
  const output = _nodes[outputId].operator.output
  const input = _nodes[inputId].operator.inputs[inputIndex]
  output.connect(input)

  _nodes[outputId].connections.push({ inputId, inputIndex })
  persist()
}

function onDisconnect(outputId, inputId, inputIndex) {
  const output = _nodes[outputId].operator.output
  const input = _nodes[inputId].operator.inputs[inputIndex]
  output.disconnect(input)

  _nodes[outputId].connections = _nodes[outputId].connections.filter(
    (c) => c.inputId !== inputId && c.inputIndex !== inputIndex,
  )
  persist()
}

function onUpdate(id, nodeProps) {
  if (!_nodes[id]) return
  Object.assign(_nodes[id].props, nodeProps)
  persist()
}

function initSidebar() {
  const sidebar = Sidebar()

  sidebar.render({
    isLocked: _isLocked,
    setLocked: (isLocked) => {
      _isLocked = isLocked
      persist()
    },
  })

  return sidebar
}

function initDropcontainer() {
  const drop = DropContainer()

  drop.render({
    fileTypes: /image\//,
    onDrop,
  })

  return drop
}

function init(appContainer, initialState) {
  _isLocked = initialState.isLocked || false

  const drop = initDropcontainer()
  const sidebar = initSidebar(appContainer)

  const graph = initFlow(() => _isLocked, {
    onClick,
    onRemove,
    onSelect,
    onConnect,
    onDisconnect,
    onUpdate,
  })

  appContainer.appendChild(drop.container)
  drop.container.appendChild(sidebar.container)
  drop.container.appendChild(graph.container)
  document.body.appendChild(appContainer)

  if (_isLocked) {
    appContainer.className = 'locked'
  }

  _sidebar = sidebar
  _graph = graph

  // Re-create nodes and connections
  if (initialState.nodes) {
    Object.entries(initialState.nodes).forEach(([id, item]) => {
      createNode(id, item.props, item.data)

      Promise.resolve().then(() => {
        item.connections.forEach(({ inputId, inputIndex }) => connectNodes(id, inputId, inputIndex))
      })
    })
  }
}

loadState().then((state = {}) => {
  console.log('Initial state', state)
  init(document.querySelector('#app'), state)
})
