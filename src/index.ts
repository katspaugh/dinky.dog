import { initDurableStream } from './lib/durable-stream.js'
import { loadData, saveData } from './lib/database.js'
import { compressObjectToString, decompressStringToObject } from './lib/compress.js'
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
  const encData = await loadData(getUrlId())
  const data = await decompressStringToObject(encData)

  console.log('Loaded data', data)

  // @ts-ignore
  const nodes = Object.entries(data.nodes).reduce((acc, [key, value]: any) => {
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

async function saveToDatabase(flowNodes: AppProps['state']['nodes'], restData: AppProps['state']) {
  const nodes = Object.entries(flowNodes).reduce((acc, [key, value]: any) => {
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
  }, {})

  const data = {
    ...restData,
    nodes,
  }

  const encData = await compressObjectToString(data)
  await saveData(data.id, encData)
}

function initSpecialPages(app: App) {
  if (!(location.pathname.startsWith('/privacy') || location.pathname.startsWith('/terms'))) return false

  const textEl = document.getElementById('text')
  const content = textEl.innerHTML
  textEl.remove()

  app.setProps({
    state: {
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
    },
  })

  return true
}

async function initPersistence(app: App) {
  let state = await loadFromDatabase()

  const save = () => {
    if (!state.id) {
      state.id = randomId()
    }
    saveToDatabase(app.getProps().state.nodes, state)
    saveToLocalStorage(state)
  }

  const updateTitle = () => {
    if (!state.title) return
    document.title = `Dinky Dog — ${state.title}`
    setUrlId(state.id, state.title)
  }

  if (state) {
    app.setProps({ state: state })
    updateTitle()
  }

  app.on('command', save)

  app.on('titleChange', ({ title }) => {
    state.title = title
    app.setProps({ state })
    save()
    updateTitle()
  })

  app.on('backgroundColorChange', ({ backgroundColor }) => {
    state.backgroundColor = backgroundColor
    app.setProps({ state })
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
