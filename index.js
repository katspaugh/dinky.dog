import { Sidebar } from './components/Sidebar.js'
import { MIN_WIDTH, MIN_HEIGHT } from './components/Node.js'
import { initFlow } from './flow.js'
import * as Operators from './operators/index.js'
import * as Persistance from './persist.js'
import { debounce } from './utils/debounce.js'
import { initDurableStream } from './services/durable-stream.js'
import { randomId } from './utils/random.js'

const WIDTH = 5000
const HEIGHT = 5000
const BROADCAST_DELAY = 300

const _clientId = Persistance.getClientId()

let state = {
  id: '',
  creator: _clientId,
  lastSequence: 0,
  isLocked: false,
  title: '',
  nodes: {},
  backgroundColor: '',
}
let _appContainer
let _sidebar
let _flow
let _streamClient
let _lastBackground

function serializeState() {
  const nodes = Object.entries(state.nodes).reduce((acc, [id, node]) => {
    const { selected, ...props } = node.props
    acc[id] = {
      props,
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

function persist(isImmediate = false, isUnload = false) {
  return Persistance.saveState(serializeState(), isImmediate, isUnload)
}

function broadcast(command, ...args) {
  if (_streamClient) {
    _streamClient.publish({ command, args, clientId: _clientId })
  }
}

const debouncedBroadcast = debounce(broadcast, BROADCAST_DELAY)

function createNode(id, props, data, clientId) {
  const operatorType = data.operatorType || Operators.Text.name
  const operator = Operators[operatorType](data.operatorData)

  state.nodes[id] = {
    props,
    data,
    operator,
    connections: [],
  }

  _flow.render({
    node: {
      id,
      ...props,
      children: operator.render(),
      clientId,
    },
  })

  if (operatorType === Operators.Text.name) {
    operator.output.subscribe((value) => {
      onTextInput(id, value)
    })
  }
}

function removeNode(id) {
  delete state.nodes[id]
  _flow.render({ nodeToRemove: id })
}

function updateNode(id, props, clientId) {
  const node = state.nodes[id]
  if (!node) return
  Object.assign(node.props, props)
  _flow.render({ node: { id, ...node.props, clientId } })
}

function updateNodeData(id, data, clientId) {
  const node = state.nodes[id]
  if (!node) return
  const operatorType = data.operatorType || node.data.operatorType || Operators.Text.name
  const operator = Operators[operatorType](data.operatorData)
  node.operator.destroy()
  node.operator = operator
  _flow.render({ node: { ...node.props, id, children: node.operator.render(), clientId } })
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

  _flow.render({
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

  _flow.render({
    edgeToRemove: {
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

function onRemoveNode(id) {
  removeNode(id)
  broadcast('cmdRemoveNode', id)
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

function getUnlockedNode(id) {
  if (state.isLocked) return
  const node = state.nodes[id]
  return node
}

function getSelectedNodes() {
  return Object.entries(state.nodes).filter(([id, node]) => node.props.selected)
}

function onTextInput(id, value) {
  const node = getUnlockedNode(id)
  if (!node) return
  debouncedBroadcast('cmdUpdateNodeData', id, { operatorData: value })
  persist()
}

function onDelete(isFocused) {
  if (state.isLocked) return

  const nodes = getSelectedNodes()
  if (!nodes.length) return

  const hasData = nodes.some(([, node]) => !!node.operator.output.get())
  const isConfirmed = hasData ? !isFocused && confirm('Delete card?') : true

  if (isConfirmed) {
    nodes.forEach(([id]) => {
      onRemoveNode(id)
    })
  }
}

function afterUndo(prevState) {
  if (state.isLocked) return
  initState(prevState)
}

async function onUndo() {
  if (state.isLocked) return
  const prevState = Persistance.loadPreviousState(state.id)

  if (prevState) {
    broadcast('cmdUndo', prevState)
    afterUndo(prevState)
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
  debouncedBroadcast('cmdUpdateNode', id, state.nodes[id].props)
  persist()
}

function clamp(value, max, min = 0) {
  return Math.min(Math.max(value, min), max)
}

function moveNodes(nodes, clientId) {
  nodes.forEach(([id, props]) => {
    updateNode(id, props, clientId)
  })
}

function onDrag(id, dx, dy) {
  if (state.isLocked) return

  let nodes = getSelectedNodes()
  if (nodes.length <= 1) {
    nodes = [[id, state.nodes[id]]]
  }

  nodes.forEach(([id, node]) => {
    const { props } = node
    const THRESHOLD = 50
    const x = clamp(Math.round(props.x + dx), WIDTH - THRESHOLD)
    const y = clamp(Math.round(props.y + dy), HEIGHT - THRESHOLD)
    updateNode(id, { x, y })
  })

  const updatedNodes = nodes.map(([id, node]) => [id, { x: state.nodes[id].props.x, y: state.nodes[id].props.y }])

  debouncedBroadcast('cmdMoveNodes', updatedNodes)
  persist()
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

function onMainBackgroundChange(backgroundColor) {
  if (state.isLocked) return
  setBackground(backgroundColor)
  persist()
}

function onUnselect() {
  if (state.isLocked) return
  getSelectedNodes().forEach(([id]) => {
    updateNode(id, { ...state.nodes[id].props, selected: false })
  })
}

function onSelect(id) {
  const node = getUnlockedNode(id)
  if (!node) return
  updateNode(id, { ...node.props, selected: true })
}

function onSelectBox(x1, y1, x2, y2) {
  if (state.isLocked) return

  const matchingNodes = Object.entries(state.nodes).filter(([id, node]) => {
    const { container } = node.operator
    const { x, y, width = container.offsetWidth, height = container.offsetHeight } = node.props
    return (
      (x > x1 && y > y1 && x + width < x2 && y + height < y2) || (x + width > x1 && y + height > y1 && x < x2 && y < y2)
    )
  })
  matchingNodes.forEach(([id]) => {
    onSelect(id)
  })
}

function onShare() {
  // Save the current state
  persist(true)
  return state.id
}

async function onFork() {
  const newState = {
    ...serializeState(),
    id: state.title ? Persistance.slugify(state.title) + '-' + randomId() : randomId(),
    creator: _clientId,
  }
  await Persistance.saveState(newState, true)
  return newState.id
}

function initSidebar() {
  const sidebar = Sidebar({
    onTitleChange: (title) => {
      if (state.isLocked) return
      setTitle(title)
      debouncedBroadcast('cmdSetTitle', title)
      persist()
    },

    setLocked:
      state.creator !== _clientId
        ? undefined
        : (isLocked) => {
          setLocked(isLocked)
          broadcast('cmdSetLocked', isLocked)
          persist()
        },

    savedFlows: Persistance.getSavedStates(),

    onShare,

    onFork,
  })

  return sidebar
}

function initState(newState) {
  // Update state properties
  state.id = newState.id || randomId()
  state.creator = newState.creator || _clientId
  state.title = newState.title
  state.isLocked = newState.isLocked || false
  state.lastSequence = newState.lastSequence || 0
  state.backgroundColor = newState.backgroundColor || ''

  // Re-create nodes and connections
  if (newState.nodes) {
    Promise.resolve().then(() => {
      // Remove old nodes
      Object.keys(state.nodes).forEach(removeNode)

      // Create new nodes
      Object.entries(newState.nodes).forEach(([id, item]) => {
        createNode(id, item.props, item.data)

        // Connect nodes
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

function onPeerMessage(peerId, command) {
  _sidebar.render({ peerId, peerDisconnected: command === 'cmdPeerDisconnect' })
}

function setLocked(isLocked) {
  state.isLocked = isLocked
  _sidebar.render({ isLocked })
  _appContainer.classList.toggle('locked', isLocked)
}

function setTitle(title) {
  state.title = title
  _sidebar.render({ title })

  if (title) {
    document.title = 'Dinky Dog — ' + title
  }
}

function setBackground(backgroundColor) {
  state.backgroundColor = backgroundColor
  _flow.render({ backgroundColor })
}

function sayHello() {
  if (document.visibilityState === 'visible') {
    broadcast('cmdHelloYourself', state.lastSequence)
  }
}

const commands = {
  cmdHello: sayHello,
  cmdCreateNode: createNode,
  cmdRemoveNode: removeNode,
  cmdConnect: connectNodes,
  cmdDisconnect: disconnectNodes,
  cmdUpdateNode: updateNode,
  cmdMoveNodes: moveNodes,
  cmdUpdateNodeData: updateNodeData,
  cmdSetLocked: setLocked,
  cmdSetTitle: setTitle,
  cmdUndo: afterUndo,
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

    if (msg.data.clientId !== _clientId) {
      const { command, args } = msg.data

      onPeerMessage(msg.data.clientId, command)

      console.log('Received msg', msg)
      if (commands[command] && (!state.isLocked || command === 'cmdSetLocked')) {
        commands[command](...args, msg.data.clientId)
      }
    }
  })

  // Send an initial message to announce our presence
  broadcast('cmdHello', state.lastSequence)

  // Send a message when the user closes the tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      broadcast('cmdPeerDisconnect')
    }
  })
}

function init(appContainer, loadedState) {
  initState(loadedState)

  const sidebar = initSidebar()

  const flow = initFlow({
    width: WIDTH,
    height: HEIGHT,
    onEmptyClick,
    onDrop,
    onSelect,
    onSelectBox,
    onUnselect,
    onConnect,
    onDisconnect,
    onDrag,
    onResize,
    onBackgroundChange,
    onDelete,
    onMainBackgroundChange,
    onUndo,
  })

  appContainer.appendChild(sidebar.container)
  appContainer.appendChild(flow.container)
  document.body.appendChild(appContainer)

  _sidebar = sidebar
  _flow = flow
  _appContainer = appContainer

  setLocked(state.isLocked)
  setTitle(state.title)
  setBackground(state.backgroundColor)

  initStreamClient()

  // Save state on leaving the page
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persist(true, true)
    }
  })
}

const DEMO = {
  nodes: {
    hello: {
      props: { x: window.innerWidth / 3, y: 40 },
      data: {
        operatorData:
          'Hello, dinky! 🐾 \n\n - Double-click to create cards\n - Press Escape to remove\n - Paste URLs to preview',
      },
    },
  },
}

Persistance.loadState()
  .catch(() => DEMO)
  .then((newState) => {
    newState = newState || DEMO
    init(document.querySelector('#app'), Object.keys(newState).length === 1 ? { ...DEMO, newState } : newState)
  })

/* Console API */
window.dinky = {
  createCard: onCreateNode,
  removeCard: onRemoveNode,
  updateNode(id, props, data) {
    onNodeUpate(props.id, props)
    if (data) {
      updateNodeData(id, data)
    }
  },
}
