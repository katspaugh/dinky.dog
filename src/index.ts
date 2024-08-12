import { initDurableStream } from './lib/durable-stream.js'
import { type DinkyDataV2, loadData, saveData } from './lib/database.js'
import {
  getClientId,
  getSavedStates,
  getUrlId,
  loadFromLocalStorage,
  saveToLocalStorage,
  setUrlId,
} from './lib/persist.js'
import { App } from './components/App.js'
import { debounce, randomId, uniqueBy } from './lib/utils.js'
import { initAuth, login, getUser } from './lib/auth.js'

const SAVE_DELAY = 5000
const clientId = getClientId()

async function initRealtimeSync(app: App, state: DinkyDataV2) {
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

async function loadFromDatabase(): Promise<DinkyDataV2 | undefined> {
  const id = getUrlId() || getLastId()
  if (!id) return

  const localData = loadFromLocalStorage(id)

  let data: DinkyDataV2
  try {
    data = await loadData(id, localData?.timestamp.toString())
  } catch (e) {
    console.error('Error loading data', e)
    return
  }

  console.log('Loaded data', data)

  return data
}

const debouncedSaveData = debounce(saveData, SAVE_DELAY)

async function saveToDatabase(state: DinkyDataV2, isUnload = false) {
  if (!state.title) return // Don't save if there's no title

  console.log('Saving data', state)

  try {
    isUnload ? await saveData(state, isUnload) : debouncedSaveData(state)
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
      isLocked: true,
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

function getDefaultState(): DinkyDataV2 {
  return {
    id: randomId(),
    lastSequence: 0,
    creator: clientId,
    isLocked: false,
    nodes: [
      {
        id: '1',
        x: window.innerWidth / 2 - 80,
        y: 100,
        content: 'Hello, dinky!',
      },
    ],
    edges: [],
    version: 2,
  }
}

async function initPersistence(app: App) {
  const state = (await loadFromDatabase()) || getDefaultState()

  const save = (isUnload = false) => {
    const props = app.getProps()
    state.nodes = uniqueBy(props.nodes, 'id')
    state.edges = props.edges
    saveToDatabase(state, isUnload)
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
    save()
    updateTitle()
  })

  app.on('backgroundColorChange', ({ backgroundColor }) => {
    state.backgroundColor = backgroundColor
    save()
  })

  app.on('lockChange', ({ isLocked }) => {
    state.isLocked = isLocked
    save()
  })

  app.on('login', () => {
    login()
    getUser().then((user) => {
      alert(user.login)
    })
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

  initAuth()

  const state = await initPersistence(app)

  getUser()
    .then((user) => {
      alert('Logged in as ' + user.login)
    })
    .catch(() => { })

  //initRealtimeSync(app, state)
}

init()
