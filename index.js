import { Sidebar } from './components/Sidebar.js'
import { Peer } from './components/Peer.js'
import { MIN_WIDTH, MIN_HEIGHT } from './components/Node.js'
import { initFlow } from './flow.js'
import * as Operators from './operators/index.js'
import { loadState, saveState, getSavedStates, getClientId } from './persist.js'
import { debounce } from './utils/debounce.js'
import { initDurableStream } from './services/durable-stream.js'
import { randomId } from './utils/random.js'

const BROADCAST_DELAY = 300
const PERSIST_DELAY = 5e3 // save every 5 seconds
const REMOVE_THRESHOLD_X = -70
const REMOVE_THRESHOLD_Y = -80

const clientId = getClientId()

let state = {
  id: '',
  creator: clientId,
  lastSequence: 0,
  isLocked: false,
  title: '',
  nodes: {},
}
const _peers = {}
let _appContainer
let _sidebar
let _graph
let _streamClient
let _lastBackground
let _unsavedChanges = 0

function serializeState() {
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

  return { ...state, nodes }
}

function persistState(onUnload = false) {
  if (_unsavedChanges > 0) {
    _unsavedChanges = 0
    saveState(serializeState(), onUnload)
  }
}

const debouncedPersist = debounce(persistState, PERSIST_DELAY)

function persist() {
  _unsavedChanges++
  debouncedPersist()
}

function broadcast(command, ...args) {
  if (_streamClient) {
    _streamClient.publish({ command, args, clientId })
  }
}

const debouncedBroadcastProps = debounce(broadcast, BROADCAST_DELAY)
const debouncedBroadcastData = debounce(broadcast, BROADCAST_DELAY)

function createNode(id, props, data) {
  const operatorType = data.operatorType || Operators.Text.name
  const operator = Operators[operatorType](data.operatorData)

  state.nodes[id] = {
    props,
    data,
    operator,
    connections: [],
  }

  _graph.render({
    node: {
      id,
      ...props,
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

function connectNodes(outputId, inputId, attempt = 0) {
  // Already connected
  if (state.nodes[outputId].connections.some((conn) => conn.inputId === inputId)) {
    return
  }

  // The node hasn't been created yet
  if (!state.nodes[inputId]) {
    if (attempt < 10) {
      setTimeout(() => connectNodes(outputId, inputId, attempt + 1), 100)
    }
    return
  }

  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.input
  output.connect(input)

  state.nodes[outputId].connections.push({ inputId })

  _graph.render({
    edge: {
      outputId,
      inputId,
    },
  })
}

function disconnectNodes(outputId, inputId) {
  const output = state.nodes[outputId].operator.output
  const input = state.nodes[inputId].operator.input
  output.disconnect(input)

  state.nodes[outputId].connections = state.nodes[outputId].connections.filter((c) => c.inputId !== inputId)

  _graph.remove({
    edge: {
      outputId,
      inputId,
    },
  })
}

function onCreateNode(id, props, data) {
  createNode(id, props, data)
  broadcast('cmdCreateNode', id, props, data)
  persist()
}

function onEmptyClick(x, y) {
  if (state.isLocked) return

  const id = randomId()
  onCreateNode(id, { x, y, background: _lastBackground }, { operatorType: Operators.Text.name })

  // Focus the new node
  if (state.nodes[id]) {
    state.nodes[id].operator.render({ focus: true })
  }
}

function onDrop({ x, y, fileType, data }) {
  if (state.isLocked) return

  const id = randomId() + fileType
  onCreateNode(id, { x, y, background: _lastBackground }, { operatorType: Operators.Image.name, operatorData: data })
}

function onTextInput(id, value) {
  if (state.isLocked) return

  const node = state.nodes[id]
  if (!node) return

  debouncedBroadcastData('cmdUpdateNodeData', id, { operatorData: value })
  persist()
}

function onRemove(id) {
  if (state.isLocked) return
  delete state.nodes[id]
  broadcast('cmdRemoveNode', id)
  persist()
}

function onEscape(id) {
  if (state.isLocked) return
  const node = state.nodes[id]
  if (!node) return

  if (!node.operator.output.get()) {
    removeNode(id)
  }
}

function onConnect(outputId, inputId) {
  if (state.isLocked) return
  connectNodes(outputId, inputId)
  broadcast('cmdConnect', outputId, inputId)
  persist()
}

function onDisconnect(outputId, inputId) {
  if (state.isLocked) return
  disconnectNodes(outputId, inputId)
  broadcast('cmdDisconnect', outputId, inputId)
  persist()
}

function onNodeUpate(id, props) {
  if (!state.nodes[id]) return
  updateNode(id, props)
  debouncedBroadcastProps('cmdUpdateNode', id, state.nodes[id].props)
  persist()
}

function onDrag(id, dx, dy) {
  if (state.isLocked) return
  if (!state.nodes[id]) return
  const { props } = state.nodes[id]
  const x = Math.round(props.x + dx)
  const y = Math.round(props.y + dy)

  if (x < REMOVE_THRESHOLD_X || y < REMOVE_THRESHOLD_Y) {
    removeNode(id)
  } else {
    onNodeUpate(id, { x, y })
  }
}

function onResize(id, dx, dy, width, height) {
  if (state.isLocked) return
  const { props } = state.nodes[id]
  onNodeUpate(id, {
    width: Math.max(MIN_WIDTH, Math.round(width + dx)),
    height: Math.max(MIN_HEIGHT, Math.round(height + dy)),
  })
}

function onBackgroundChange(id, background) {
  if (state.isLocked) return
  _lastBackground = background
  onNodeUpate(id, { background })
}

function onSelect(id) {
  const node = state.nodes[id]
  if (!node) return
  //
}

function onShare() {
  // Save the current state
  persistState()
  return state.id
}

function initSidebar() {
  const sidebar = Sidebar({
    onTitleChange: (title) => {
      if (state.isLocked) return
      setTitle(title)
      debouncedBroadcastData('cmdSetTitle', title)
      persist()
    },

    setLocked:
      state.creator !== clientId
        ? undefined
        : (isLocked) => {
            setLocked(isLocked)
            broadcast('cmdSetLocked', isLocked)
            persist()
          },

    savedFlows: getSavedStates(),

    onShare,
  })

  return sidebar
}

function initState(newState) {
  // Update state properties
  state.id = newState.id || randomId()
  state.creator = newState.creator || clientId
  state.title = newState.title
  state.isLocked = newState.isLocked || false
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
            item.connections.forEach(({ inputId }) => connectNodes(id, inputId))
          })
        }
      })
    })
  } else {
    newState.nodes = {}
  }

  console.log('State', state)
}

function onPeerMessage(peerId, isMe, command) {
  if (commands[command] === peerDisonnect) return

  if (!_peers[peerId]) {
    const peer = Peer({
      id: peerId,
      isMe,
      onExpire: () => {
        if (isMe) return
        delete _peers[peerId]
        peer.destroy()
      },
    })
    _sidebar.render({ peer: peer.render() })
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

function setLocked(isLocked) {
  state.isLocked = isLocked
  _sidebar.render({ isLocked })
  _appContainer.classList.toggle('locked', isLocked)
}

function setTitle(title) {
  state.title = title
  _sidebar.render({ title })
}

const commands = {
  cmdCreateNode: createNode,
  cmdRemoveNode: removeNode,
  cmdConnect: connectNodes,
  cmdDisconnect: disconnectNodes,
  cmdUpdateNode: updateNode,
  cmdUpdateNodeData: updateNodeData,
  cmdPeerDisconnect: peerDisonnect,
  cmdSetLocked: setLocked,
  cmdSetTitle: setTitle,
}

async function initStreamClient() {
  const streamId = state.id

  onPeerMessage(clientId, true)

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

    onPeerMessage(msg.data.clientId, msg.data.clientId === clientId, msg.data.command)

    if (msg.data.clientId !== clientId) {
      console.log('Received msg', msg)

      const { command, args } = msg.data
      if (commands[command] && (!state.isLocked || command === 'cmdSetLocked')) {
        commands[command](...args)
      }
    }
  })

  // Send an initial message to announce our presence
  broadcast('cmdHello', state.lastSequence)

  // Send a message when the user closes the tab
  window.addEventListener('beforeunload', () => {
    broadcast('cmdPeerDisconnect')
  })
}

function initPersistance() {
  document.addEventListener('visibilitychange', () => {
    if (_unsavedChanges && document.visibilityState === 'hidden') {
      persistState(true)
    }
  })
}

function init(appContainer, loadedState) {
  initState(loadedState)

  const sidebar = initSidebar()

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

  appContainer.appendChild(sidebar.container)
  appContainer.appendChild(graph.container)
  document.body.appendChild(appContainer)

  _sidebar = sidebar
  _graph = graph
  _appContainer = appContainer

  setLocked(state.isLocked)
  setTitle(state.title)

  initStreamClient()
  initPersistance()
}

const DEMO = {
  nodes: {
    q6jjaugt7vg: {
      props: { x: 79, y: 114 },
      connections: [{ inputId: 'jnnnjq2uvic' }],
      data: { operatorData: 'Hello' },
    },
    jnnnjq2uvic: { props: { x: 387, y: 69 }, connections: [], data: { operatorData: 'world!' } },
  },
}

loadState()
  .catch(() => DEMO)
  .then((newState) => {
    newState = newState || DEMO
    init(document.querySelector('#app'), Object.keys(newState).length === 1 ? { ...DEMO, newState } : newState)
  })
