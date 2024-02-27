import { Sidebar } from './components/Sidebar.js'
import { initFlow } from './flow.js'
import { HEIGHT } from './components/Node.js'
import * as Operators from './operators/index.js'
import { saveState, loadState } from './persist.js'
import { debounce } from './utils/debounce.js'
import { parseUrl } from '../utils/parse-text.js'

let state = {
  isLocked: false,
  title: '',
  lastBackground: undefined,
  nodes: {},
}
let _sidebar = null
let _graph = null

const persist = debounce(() => {
  const nodes = Object.entries(state.nodes).reduce((acc, [id, node]) => {
    acc[id] = {
      props: node.props,
      connections: node.connections,
      data: {
        ...node.data,
        operatorData: node.operator.serialize(),
      },
    }
    return acc
  }, {})
  saveState({ ...state, nodes })
}, 500)

function randomId() {
  return Math.random().toString(32).slice(2)
}

function createNode(id, props, data) {
  const operator = Operators[data.operatorType](data.operatorData)

  state.nodes[id] = {
    props,
    data,
    operator,
    connections: [],
  }

  _graph.render({
    node: {
      background: state.lastBackground,
      ...props,
      id,
      inputsCount: operator.inputs.length,
      children: operator.render(),
    },
  })

  if (data.operatorType === Operators.Text.name) {
    operator.output.subscribe((value) => {
      persist()
      onTextInput(id, value)
    })
  }
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
  persist()
}

function onDrop({ x, y, fileType, data }) {
  const id = randomId() + fileType
  createNode(id, { x, y }, { operatorType: Operators.Image.name, operatorData: data })
  persist()
}

function onTextInput(id, value) {
  const node = state.nodes[id]
  const newId = id + '-preview'
  if (!node || state.nodes[newId]) return

  if (parseUrl(value)) {
    const props = { x: node.props.x, y: node.props.y + (node.props.height || HEIGHT) + 10, width: 300, height: 190 }
    createNode(newId, props, { operatorType: Operators.LinkPreview.name, operatorData: value })
    connectNodes(id, newId, 0)
  }
}

function onRemove(id) {
  if (state.isLocked) return
  delete state.nodes[id]
  persist()
}

function onSelect(id) {
  const node = state.nodes[id]
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
  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.connect(input)

  state.nodes[outputId].connections.push({ inputId, inputIndex })
  persist()
}

function onDisconnect(outputId, inputId, inputIndex) {
  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.disconnect(input)

  state.nodes[outputId].connections = state.nodes[outputId].connections.filter(
    (c) => c.inputId !== inputId && c.inputIndex !== inputIndex,
  )
  persist()
}

function onUpdate(id, nodeProps) {
  if (!state.nodes[id]) return

  Object.assign(state.nodes[id].props, nodeProps)

  if (nodeProps.background) {
    state.lastBackground = nodeProps.background
  }

  persist()
}

function initSidebar(onLockChange) {
  const sidebar = Sidebar({
    title: state.title,

    setTitle: (title) => {
      if (state.isLocked) return
      state.title = title
      persist()
    },

    isLocked: state.isLocked,

    setLocked: (isLocked) => {
      state.isLocked = isLocked
      onLockChange()
      persist()
    },
  })

  onLockChange()

  return sidebar
}

function init(appContainer, initialState) {
  state.isLocked = initialState.isLocked
  state.title = initialState.title

  const sidebar = initSidebar(() => {
    appContainer.className = state.isLocked ? 'locked' : ''
  })

  const graph = initFlow(() => state.isLocked, {
    onClick,
    onDrop,
    onRemove,
    onSelect,
    onConnect,
    onDisconnect,
    onUpdate,
  })

  appContainer.appendChild(graph.container)
  appContainer.appendChild(sidebar.container)
  document.body.appendChild(appContainer)

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

const DEMO = {
  nodes: {
    jnnnjq2uvic: { props: { x: 287, y: 69 }, connections: [], data: { operatorType: 'Text', operatorData: 'world' } },
    q6jjaugt7vg: {
      props: { x: 79, y: 114 },
      connections: [{ inputId: 'jnnnjq2uvic', inputIndex: 0 }],
      data: { operatorType: 'Text', operatorData: 'Hello' },
    },
  },
}

loadState().then((initialState = DEMO) => {
  console.log('Initial state', initialState)
  init(document.querySelector('#app'), initialState)
})
