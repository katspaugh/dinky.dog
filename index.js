import { Sidebar } from './components/Sidebar.js'
import { Peer } from './components/Peer.js'
import { MyCharts } from './components/MyCharts.js'
import { initFlow } from './flow.js'
import { WIDTH, HEIGHT } from './components/Node.js'
import * as Operators from './operators/index.js'
import { parseUrl } from './utils/parse-text.js'
import { saveState, loadState, getSavedStates } from './persist.js'
import { debounce } from './utils/debounce.js'
import { initDurableStream, getClientId } from './services/durable-stream.js'

const PERSIST_DELAY = 300
const BROADCAST_DELAY = 300
const REMOVE_THRESHOLD_X = -70
const REMOVE_THRESHOLD_Y = -30

const clientId = getClientId()
let state = {
  id: '',
  lastSequence: 0,
  isLocked: false,
  title: '',
  nodes: {},
}
const _peers = {}
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
}, PERSIST_DELAY)

const broadcast = debounce((command, ...args) => {
  if (_streamClient) {
    _streamClient.publish({ command, args, clientId })
  }
}, BROADCAST_DELAY)

function randomId() {
  return Math.random().toString(36).slice(2)
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

function removeNode(id) {
  _graph.remove({ node: id })
}

function updateNode(id, props) {
  const node = state.nodes[id]
  if (!node) return
  Object.assign(node.props, props)
  _graph.render({ node: { id, ...node.props } })
}

function updateNodeData(id, data) {
  const node = state.nodes[id]
  if (!node) return
  const operatorType = data.operatorType || node.data.operatorType || Operators.Text.name
  const operator = Operators[operatorType](data.operatorData)
  node.operator.destroy()
  node.operator = operator
  _graph.render({ node: { ...node.props, id, children: node.operator.render() } })
}

function connectNodes(outputId, inputId, inputIndex) {
  // Already connected
  if (state.nodes[outputId].connections.some((conn) => conn.inputId === inputId && conn.inputIndex === inputIndex)) {
    return
  }

  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.connect(input)

  state.nodes[outputId].connections.push({ inputId, inputIndex })

  _graph.render({
    edge: {
      outputId,
      inputId,
      inputIndex,
    },
  })
}

function disconnectNodes(outputId, inputId, inputIndex) {
  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.inputs[inputIndex]
  output.disconnect(input)

  state.nodes[outputId].connections = state.nodes[outputId].connections.filter(
    (c) => c.inputId !== inputId && c.inputIndex !== inputIndex,
  )

  _graph.remove({
    edge: {
      outputId,
      inputId,
      inputIndex,
    },
  })
}

function onCreateNode(id, props, data) {
  createNode(id, props, data)
  persist()
  broadcast('cmdCreateNode', id, props, data)
}

function onEmptyClick(x, y) {
  if (state.isLocked) return
  const id = randomId()
  onCreateNode(id, { x, y }, { operatorType: Operators.Text.name })
}

function onDrop({ x, y, fileType, data }) {
  const id = randomId() + fileType
  onCreateNode(id, { x, y }, { operatorType: Operators.Image.name, operatorData: data })
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
  broadcast('cmdUpdateNodeData', id, { operatorData: value })
}

function onRemove(id) {
  if (state.isLocked) return
  delete state.nodes[id]
  persist()
  broadcast('cmdRemoveNode', id)
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
    broadcast('cmdRemoveNode', id)
  }
}

function onConnect(outputId, inputId, inputIndex) {
  connectNodes(outputId, inputId, inputIndex)
  persist()
  broadcast('cmdConnect', outputId, inputId, inputIndex)
}

function onDisconnect(outputId, inputId, inputIndex) {
  disconnectNodes(outputId, inputId, inputIndex)
  persist()
  broadcast('cmdDisconnect', outputId, inputId, inputIndex)
}

function onNodeUpate(id, props) {
  if (state.isLocked) return
  if (!state.nodes[id]) return
  updateNode(id, props)
  persist()
  broadcast('cmdUpdateNode', id, state.nodes[id].props)
}

function onDrag(id, dx, dy) {
  if (!state.nodes[id]) return
  const { props } = state.nodes[id]
  const x = Math.round(props.x + dx)
  const y = Math.round(props.y + dy)
  onNodeUpate(id, { x, y })

  if (x < REMOVE_THRESHOLD_X || y < REMOVE_THRESHOLD_Y) {
    removeNode(id)
  }
}

function onResize(id, dx, dy) {
  const { props } = state.nodes[id]
  onNodeUpate(id, {
    width: Math.max(WIDTH, Math.round((props.width || WIDTH) + dx)),
    height: Math.max(HEIGHT, Math.round((props.height || HEIGHT) + dy)),
  })
}

function onBackgroundChange(id, background) {
  onNodeUpate(id, { background })
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

    setLocked:
      state.isLocked || state.isLocked !== clientId
        ? undefined
        : (isLocked) => {
            state.isLocked = isLocked ? clientId : false
            persist()
            onLockChange()
            return isLocked
          },
  })

  const peer = Peer({
    id: clientId,
    isMe: true,
    onExpire: () => {},
  })
  sidebar.render({ myPeer: peer.render() })

  onLockChange()

  return sidebar
}

function initState(newState) {
  // Update state properties
  state.id = newState.id || randomId()
  state.title = newState.title
  state.isLocked = newState.isLocked
  state.lastSequence = newState.lastSequence || 0

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
        createNode(id, item.props, item.data)

        if (item.connections) {
          Promise.resolve().then(() => {
            item.connections.forEach(({ inputId, inputIndex }) => connectNodes(id, inputId, inputIndex))
          })
        }
      })
    })
  }

  console.log('State', state)
}

function onPeerMessage(peerId, isMe) {
  if (!_peers[peerId]) {
    const peer = Peer({
      id: peerId,
      isMe,
      onExpire: () => {
        delete _peers[peerId]
        peer.destroy()
      },
    })
    _sidebar.render({ peerContainer: peer.render() })
    _peers[peerId] = peer
  } else {
    _peers[peerId].render()
  }
}

function peerDisonnect(peerId) {
  if (_peers[peerId]) {
    _peers[peerId].destroy()
    delete _peers[peerId]
  }
}

const commands = {
  cmdCreateNode: createNode,
  cmdRemoveNode: removeNode,
  cmdConnect: connectNodes,
  cmdDisconnect: disconnectNodes,
  cmdUpdateNode: updateNode,
  cmdUpdateNodeData: updateNodeData,
  cmdPeerDisconnect: peerDisonnect,
}

async function initStreamClient() {
  const streamId = state.id

  try {
    _streamClient = await initDurableStream(streamId)
  } catch (err) {
    console.error('Failed to init stream client', err)
    return
  }

  _streamClient.subscribe(state.lastSequence, (msg, ack) => {
    ack()

    if (state.id !== streamId) return

    state.lastSequence = msg.sequence

    onPeerMessage(msg.data.clientId, msg.data.clientId === clientId)

    if (msg.data.clientId !== clientId) {
      console.log('Received msg', msg)

      const { command, args } = msg.data
      if (commands[command]) {
        commands[command](...args)
      }

      persist()
    }
  })

  // Send an initial message to announce our presence
  broadcast('cmdHello')

  // Send a message when the user closes the tab
  window.addEventListener('beforeunload', () => {
    broadcast('cmdPeerDisconnect')
  })
}

function initMyCharts() {
  const savedStates = getSavedStates()
  if (savedStates.length) {
    const container = MyCharts().render({ charts: savedStates })
    _sidebar.container.appendChild(container)
  }
}

function init(appContainer, loadedState) {
  initState(loadedState)

  const sidebar = initSidebar(() => {
    appContainer.className = state.isLocked ? 'locked' : ''
  })

  const graph = initFlow({
    onEmptyClick,
    onDrop,
    onRemove,
    onSelect,
    onConnect,
    onDisconnect,
    onDrag,
    onResize,
    onBackgroundChange,
    onEscape,
  })

  appContainer.appendChild(graph.container)
  appContainer.appendChild(sidebar.container)
  document.body.appendChild(appContainer)

  _sidebar = sidebar
  _graph = graph

  initMyCharts()
  initStreamClient()
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
