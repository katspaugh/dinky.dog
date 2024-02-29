import { Sidebar } from './components/Sidebar.js'
import { initFlow } from './flow.js'
import { HEIGHT } from './components/Node.js'
import * as Operators from './operators/index.js'
import { parseUrl } from '../utils/parse-text.js'
import { saveState, loadState } from './persist.js'
import { debounce } from '../utils/debounce.js'
import { initDurableStream } from './services/durable-stream.js'

const clientId = Math.random()
const PERSIST_DELAY = 300

let state = {
  id: '',
  isLocked: false,
  title: '',
  nodes: {},
}
let _sidebar = null
let _graph = null
let _streamClient = null
let _lockPublishing = false

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

  if (_streamClient && !_lockPublishing) {
    _streamClient.publish({ state: serializedState, clientId })
  }

  saveState(serializedState)
}, PERSIST_DELAY)

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

  connectInputOutput(outputId, inputId, inputIndex)
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

function removeNode(id) {
  _graph.remove({ node: id })
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
    removeNode(id)
  }
}

function connectInputOutput(outputId, inputId, inputIndex) {
  // Already connected
  if (state.nodes[outputId].connections.some((conn) => conn.inputId === inputId && conn.inputIndex === inputIndex)) {
    return
  }

  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.connect(input)

  state.nodes[outputId].connections.push({ inputId, inputIndex })
}

function disconnectInputOutput(outputId, inputId, inputIndex) {
  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.disconnect(input)

  state.nodes[outputId].connections = state.nodes[outputId].connections.filter(
    (c) => c.inputId !== inputId && c.inputIndex !== inputIndex,
  )
}

function removeConnection(outputId, inputId, inputIndex) {
  disconnectInputOutput(outputId, inputId, inputIndex)
  _graph.remove({ edge: { outputId, inputId, inputIndex } })
}

function onConnect(outputId, inputId, inputIndex) {
  connectInputOutput(outputId, inputId, inputIndex)
  persist()
}

function onDisconnect(outputId, inputId, inputIndex) {
  disconnectInputOutput(outputId, inputId, inputIndex)
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

let _lockTimeout = null
function initState(newState) {
  _lockPublishing = true

  if (_lockTimeout) clearTimeout(_lockTimeout)
  _lockTimeout = setTimeout(() => {
    _lockPublishing = false
  }, PERSIST_DELAY + 100)

  // Update state properties
  state.id = newState.id || randomId()
  state.title = newState.title
  state.isLocked = newState.isLocked

  // Re-create nodes and connections
  if (newState.nodes) {
    Promise.resolve().then(() => {
      // Remove old nodes
      Object.keys(state.nodes).forEach((id) => {
        if (!newState.nodes[id]) {
          removeNode(id)
        }
      })

      Object.entries(newState.nodes).forEach(([id, item]) => {
        if (state.nodes[id]) {
          state.nodes[id].operator.destroy()
          state.nodes[id].connections.forEach(({ inputId, inputIndex }) => removeConnection(id, inputId, inputIndex))
        }

        createNode(id, item.props, item.data)

        if (item.connections) {
          Promise.resolve().then(() => {
            item.connections.forEach(({ inputId, inputIndex }) => connectNodes(id, inputId, inputIndex))
          })
        }
      })
    })
  }

  persist()
}

function init(appContainer, loadedState) {
  initState(loadedState)

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

  // Init durable stream
  initDurableStream(state.id)
    .then((client) => {
      _streamClient = client
      return client.info()
    })
    .then((info) => {
      _streamClient.subscribe(info.sequence, (msg, ack) => {
        ack()

        if (msg.data.clientId !== clientId) {
          console.log('Received state', msg)
          initState(msg.data.state)
        }
      })
    })
    .catch((err) => {
      console.error('Failed to init a Durable Stream', err)
    })
}

const DEMO = {
  id: randomId(),
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
  .then((loadedState) => {
    init(document.querySelector('#app'), loadedState || DEMO)
  })
