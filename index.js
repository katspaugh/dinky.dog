import { Sidebar } from './components/Sidebar.js'
import { initFlow } from './flow.js'
import { HEIGHT } from './components/Node.js'
import * as Operators from './operators/index.js'
import { saveState, loadState } from './persist.js'
import { debounce } from './utils/debounce.js'
import { parseUrl } from '../utils/parse-text.js'
import { initDurableStream } from './services/durable-stream.js'

let clientId = localStorage.getItem('dinky_clientId') || Math.random()
localStorage.setItem('dinky_clientId', clientId)

let state = {
  id: '',
  isLocked: false,
  title: '',
  nodes: {},
}
let _sidebar = null
let _graph = null
let _streamClient = null

const persist = debounce(() => {
  const nodes = Object.entries(state.nodes).reduce((acc, [id, node]) => {
    acc[id] = {
      props: node.props,
      connections: node.connections.length ? node.connections : undefined,
      data: {
        ...node.data,
        operatorData: node.operator.serialize(),
        operatorType: node.data.operatorType === Operators.Text.name ? undefined : node.data.operatorType,
      },
    }
    return acc
  }, {})

  const serializedState = { ...state, nodes }

  saveState(serializedState)

  if (_streamClient) {
    _streamClient.publish({ state: serializedState, clientId })
  }
}, 500)

function randomId() {
  return Math.random().toString(32).slice(2)
}

function createNode(id, props, data) {
  const operatorType = data.operatorType || Operators.Text.name
  const operator = Operators[operatorType](data.operatorData)

  state.nodes[id] = {
    props,
    data,
    operator,
    connections: [],
  }

  const { x, y, width, height, background } = props
  _graph.render({
    node: {
      id,
      x,
      y,
      width,
      height,
      background,
      inputsCount: operator.inputs.length,
      children: operator.render(),
    },
  })

  if (operatorType === Operators.Text.name) {
    operator.output.subscribe((value) => {
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

  persist()
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

function onEscape(id) {
  const node = state.nodes[id]
  if (!node) return

  if (!node.operator.output.get()) {
    _graph.remove({ node: id })
  }
}

function onConnect(outputId, inputId, inputIndex) {
  // Already connected
  if (state.nodes[outputId].connections.some((conn) => conn.inputId === inputId && conn.inputIndex === inputIndex)) {
    return
  }

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

function initState(newState) {
  state = newState

  // Re-create nodes and connections
  if (newState.nodes) {
    Object.entries(newState.nodes).forEach(([id, item]) => {
      if (state.nodes[id]) {
        _graph.remove({ node: id })
      }

      createNode(id, item.props, item.data)

      if (item.connections) {
        Promise.resolve().then(() => {
          item.connections.forEach(({ inputId, inputIndex }) => connectNodes(id, inputId, inputIndex))
        })
      }
    })
  }
}

function init(appContainer, initialState) {
  state = { ...state, ...initialState }
  state.id = state.id || randomId()

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
    onEscape,
  })

  appContainer.appendChild(graph.container)
  appContainer.appendChild(sidebar.container)
  document.body.appendChild(appContainer)

  _sidebar = sidebar
  _graph = graph

  initState(state)

  // Init durable stream
  initDurableStream(state.id).then(async (client) => {
    _streamClient = client

    client.subscribe(client.lastSequence, async (msg, ack) => {
      if (msg.data.clientId !== clientId) {
        console.log('Received state', msg.data.state)
        initState(msg.data.state)
      }
      ack()
    })
  })
}

const DEMO = {
  nodes: {
    q6jjaugt7vg: {
      props: { x: 79, y: 114 },
      connections: [{ inputId: 'jnnnjq2uvic', inputIndex: 0 }],
      data: { operatorData: 'Hello' },
    },
    jnnnjq2uvic: { props: { x: 287, y: 69 }, connections: [], data: { operatorData: 'world!' } },
  },
}

loadState()
  .catch(() => DEMO)
  .then((initialState = DEMO) => {
    console.log('Initial state', initialState)
    init(document.querySelector('#app'), initialState)
  })
