import { initDurableStream } from './lib/durable-stream.js'
import { DinkyData, loadData, saveData } from './lib/database.js'
import {
  getClientId,
  getSavedStates,
  getUrlId,
  loadFromLocalStorage,
  saveToLocalStorage,
  setUrlId,
} from './lib/persist.js'
import { App, type EdgeProps, type NodeProps, type AppProps } from './components/App.js'
import { debounce, randomId } from './lib/utils.js'

const SAVE_DELAY = 5000

async function initRealtimeSync(app: App, state: AppProps) {
  const clientId = getClientId()
  let peers = []

  const durableClient = await initDurableStream({
    subject: state.id,
    lastSequence: state.lastSequence,
    onMessage: (msg) => {
      state.lastSequence = msg.sequence

      if (msg.data.clientId !== clientId) {
        console.log('Received message', msg)

        if (!peers.includes(msg.data.clientId)) {
          peers = peers.concat([msg.data.clientId])
          app.setProps({ peers })
        }

        if (msg.data.command) {
          app.callCommand(msg.data.command, msg.data.params)
        }

        if (msg.data.message === 'ping') {
          durableClient.publish({
            clientId,
            message: 'pong',
          })
        }
      }
    },
  })

  app.on('command', ({ command, params }) => {
    durableClient.publish({
      clientId,
      command,
      params,
    })
  })

  durableClient.publish({
    clientId,
    message: 'ping',
  })
}

function getLastId() {
  const savedStates = getSavedStates()
  return savedStates?.[0]?.id
}

async function loadFromDatabase(): Promise<AppProps | undefined> {
  const id = getUrlId() || getLastId()
  if (!id) return

  const localData = loadFromLocalStorage(id)

  let data: DinkyData
  try {
    data = await loadData(id, localData?.timestamp.toString())
  } catch (e) {
    console.error('Error loading data', e)
    return
  }

  console.log('Loaded data', data)

  const nodes = Object.entries(data.nodes).map(([id, node]) => {
    return {
      id,
      content: node.data.operatorData,
      x: node.props.x,
      y: node.props.y,
      width: node.props.width,
      height: node.props.height,
      color: node.props.background,
    }
  })

  const edges = Object.entries(data.nodes).reduce<EdgeProps[]>((acc, [id, node]) => {
    node.connections.forEach((conn) => {
      acc.push({ fromNode: id, toNode: conn.inputId })
    })
    return acc
  }, [])

  return { ...data, nodes, edges }
}

const debouncedSaveData = debounce(saveData, SAVE_DELAY)

async function saveToDatabase(
  appData: { nodes: NodeProps[]; edges: EdgeProps[] },
  restData: AppProps,
  isUnload = false,
) {
  const nodes = appData.nodes.reduce((acc, value) => {
    const { id } = value
    acc[id] = {
      data: {
        operatorData: value.content,
      },
      props: {
        x: value.x,
        y: value.y,
        width: value.width,
        height: value.height,
        background: value.color,
      },
      connections: appData.edges.filter((edge) => edge.fromNode === id).map((edge) => ({ inputId: edge.toNode })),
    }
    return acc
  }, {} as DinkyData)

  const data = {
    ...restData,
    nodes,
  }

  console.log('Saving data', data)

  try {
    isUnload ? await saveData(data, isUnload) : debouncedSaveData(data)
  } catch (e) {
    console.error('Error saving data', e)
  }
}

function initSpecialPages(app: App) {
  if (getUrlId()?.startsWith('about')) {
    loadFromDatabase().then((state) => app.setProps(state))
    return true
  }

  if (location.pathname.startsWith('/privacy') || location.pathname.startsWith('/terms')) {
    const textEl = document.getElementById('text')
    const content = textEl.innerHTML
    textEl.remove()

    app.setProps({
      id: location.pathname,
      title: document.title,
      lastSequence: 0,
      nodes: [
        {
          id: '1',
          content,
          x: 20,
          y: 20,
          width: window.innerWidth > 1000 ? window.innerWidth * 0.7 : window.innerWidth - 40,
          height: window.innerHeight - 40,
        },
      ],
      edges: [],
    })

    return true
  }
}

function getDefaultState(): AppProps {
  return {
    id: randomId(),
    lastSequence: 0,
    nodes: [
      {
        id: '1',
        x: window.innerWidth / 2 - 80,
        y: 100,
        content: 'Hello, dinky!',
      },
    ],
    edges: [],
  }
}

async function initPersistence(app: App) {
  const state = (await loadFromDatabase()) || getDefaultState()

  const save = (isUnload = false) => {
    saveToDatabase(app.getProps(), state, isUnload)
    saveToLocalStorage(state)
  }

  const updateTitle = () => {
    if (state.title) {
      document.title = `Dinky Dog — ${state.title}`
      setUrlId(state.id, state.title)
    }
  }

  updateTitle()

  app.setProps(state)

  app.on('command', () => save())

  app.on('titleChange', ({ title }) => {
    state.title = title
    app.setProps({ title })
    save()
    updateTitle()
  })

  app.on('backgroundColorChange', ({ backgroundColor }) => {
    state.backgroundColor = backgroundColor
    app.setProps({ backgroundColor })
    save()
  })

  window.addEventListener('beforeunload', () => {
    save(true)
  })

  return state
}

async function init() {
  const app = new App()
  document.body.append(app.container)

  if (initSpecialPages(app)) return

  const state = await initPersistence(app)

  initRealtimeSync(app, state)
}

init()
