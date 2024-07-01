import { initDurableStream } from './lib/durable-stream.js'
import { DinkyData, loadData, saveData } from './lib/database.js'
import { getClientId, getUrlId, saveToLocalStorage, setUrlId } from './lib/persist.js'
import { App, type AppProps } from './components/App.js'
import { debounce, randomId } from './lib/utils.js'

const SAVE_DELAY = 5000

async function initRealtimeSync(app: App, state: AppProps) {
  const clientId = getClientId()

  const durableClient = await initDurableStream({
    subject: state.id,
    lastSequence: state.lastSequence,
    onMessage: (msg) => {
      state.lastSequence = msg.sequence

      if (msg.data.clientId !== clientId) {
        console.log('Received message', msg)

        if (msg.data.command) {
          app.callCommand(msg.data.command, msg.data.params)
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
}

async function loadFromDatabase() {
  const id = getUrlId()
  if (!id) return
  let data: DinkyData
  try {
    data = await loadData(id)
  } catch (e) {
    console.error('Error loading data', e)
    return
  }

  console.log('Loaded data', data)

  const nodes = Object.entries(data.nodes).reduce((acc, [key, value]) => {
    acc[key] = {
      id: key,
      content: value.data.operatorData,
      x: value.props.x,
      y: value.props.y,
      width: value.props.width,
      height: value.props.height,
      background: value.props.background,
      connections: value.connections?.map((item) => item.inputId) || [],
    }
    return acc
  }, {})

  return { ...data, nodes }
}

const debouncedSaveData = debounce(saveData, SAVE_DELAY)

async function saveToDatabase(flowNodes: AppProps['nodes'], restData: AppProps, isUnload = false) {
  const nodes = Object.entries(flowNodes).reduce<DinkyData>((acc, [key, value]) => {
    acc[key] = {
      data: {
        operatorData: value.content,
      },
      props: {
        x: value.x,
        y: value.y,
        width: value.width,
        height: value.height,
        background: value.background,
      },
      connections: value.connections.map((inputId) => ({ inputId })),
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
  if (!(location.pathname.startsWith('/privacy') || location.pathname.startsWith('/terms'))) return false

  const textEl = document.getElementById('text')
  const content = textEl.innerHTML
  textEl.remove()

  app.setProps({
    id: location.pathname,
    lastSequence: 0,
    nodes: {
      '1': {
        id: '1',
        content,
        x: 20,
        y: 20,
        width: window.innerWidth > 1000 ? window.innerWidth * 0.7 : window.innerWidth - 40,
        height: window.innerHeight - 40,
        connections: [],
      },
    },
  })

  return true
}

function getDefaultState(): AppProps {
  return {
    id: randomId(),
    lastSequence: 0,
    nodes: {
      '1': {
        id: '1',
        x: window.innerWidth / 2 - 80,
        y: 100,
        content: 'Hello, dinky!',
        connections: [],
      },
    },
  }
}

async function initPersistence(app: App) {
  const state = (await loadFromDatabase()) || getDefaultState()

  const save = (isUnload = false) => {
    saveToDatabase(app.getProps().nodes, state, isUnload)
  }

  const updateTitle = () => {
    if (!state.title) return
    document.title = `Dinky Dog — ${state.title}`
    setUrlId(state.id, state.title)
    saveToLocalStorage({ id: state.id, title: state.title })
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

  window.addEventListener('beforeunload', (e) => {
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
