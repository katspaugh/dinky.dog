import { initDurableStream } from './lib/durable-stream.js'
import { DinkyData, loadData, saveData } from './lib/database.js'
import { getClientId, getUrlId, saveToLocalStorage, setUrlId } from './lib/persist.js'
import { App, type AppProps } from './components/App.js'
import { randomId } from './lib/utils.js'

async function initRealtimeSync(app: App, lastSequence = 0) {
  const clientId = getClientId()

  const durableClient = await initDurableStream({
    subject: 'test5',
    lastSequence,
    onMessage: (msg) => {
      if (msg.data.clientId !== clientId) {
        console.log('Received message', msg)
        app.callCommand(msg.data.command, msg.data.params)
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

async function saveToDatabase(flowNodes: AppProps['nodes'], restData: AppProps) {
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

  await saveData(data)
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

async function initPersistence(app: App) {
  let state = await loadFromDatabase()

  const save = () => {
    if (!state.title) return // Don't autosave if no title
    saveToDatabase(app.getProps().nodes, state)
    saveToLocalStorage({ id: state.id, title: state.title })
  }

  const updateTitle = () => {
    if (!state.title) return
    document.title = `Dinky Dog — ${state.title}`
    setUrlId(state.id, state.title)
  }

  if (state) {
    app.setProps(state)
    updateTitle()
  } else {
    state = {
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
    app.setProps(state)
  }

  app.on('command', save)

  app.on('titleChange', ({ title }) => {
    state.title = title
    app.setProps(state)
    save()
    updateTitle()
  })

  app.on('backgroundColorChange', ({ backgroundColor }) => {
    state.backgroundColor = backgroundColor
    app.setProps(state)
    save()
  })

  return state
}

async function init() {
  const app = new App()
  document.body.append(app.container)

  if (initSpecialPages(app)) return

  const data = await initPersistence(app)

  //initRealtimeSync(flow, data?.lastSequence)
}

init()
