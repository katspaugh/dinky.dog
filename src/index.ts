import { initDurableStream } from './lib/durable-stream.js'
import { type DinkyDataV2, loadData, saveData } from './lib/database.js'
import { getClientId, getSavedStates, loadFromLocalStorage, saveToLocalStorage } from './lib/persist.js'
import { App } from './components/App.js'
import { debounce, randomId, uniqueBy } from './lib/utils.js'
import { getUrlId, setUrlId } from './lib/url.js'

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
  try {
    return await loadData(id)
  } catch (e) {
    console.error('Error loading data', e)
  }
}

function initSpecialPages(app: App) {
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
    nodes: [],
    edges: [],
    version: 2,
  }
}

function toggleChangesIndicator(changes: number) {
  if (changes <= 1) {
    document.title = changes === 0 ? document.title.replace(/^✱ /, '') : '✱ ' + document.title
  }
}

async function initPersistence(app: App) {
  const debouncedSaveData = debounce(saveData, SAVE_DELAY)
  const state = (await loadFromDatabase()) || getDefaultState()
  let changes = 0

  const save = async (password?: string, isUnload = false) => {
    const isSettingPassword = !!password

    // Indicate changes
    changes++
    toggleChangesIndicator(changes)

    // Don't save if there's no title
    if (!state.title && !isSettingPassword) return

    if (!password) {
      const localData = loadFromLocalStorage(state.id)
      password = localData?.password
    }

    const props = app.getProps()
    state.nodes = uniqueBy(props.nodes, 'id')
    state.edges = props.edges
    saveToLocalStorage(state, password)

    try {
      const saveFn = isSettingPassword || isUnload ? saveData : debouncedSaveData
      await saveFn(state, password, isUnload)
    } catch (e) {
      console.error('Error saving data', e)
      if (isSettingPassword) throw e
    }

    changes = 0
    toggleChangesIndicator(changes)
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
    updateTitle()
    save()
  })

  app.on('backgroundColorChange', ({ backgroundColor }) => {
    state.backgroundColor = backgroundColor
    save()
  })

  app.on('lockChange', async ({ isLocked }) => {
    const password = prompt('Enter password')
    if (!password) return

    state.isLocked = isLocked
    try {
      await save(password)
    } catch (e) {
      state.isLocked = !isLocked
      if (/401/.test(e.message)) {
        alert('Incorrect password')
      }
      return
    }
    app.setProps(state)
  })

  window.addEventListener('beforeunload', (e) => {
    if (state.isLocked || !changes) return

    if (state.title) {
      save(undefined, true)
    } else {
      e.preventDefault()
    }
  })

  return state
}

async function init() {
  const app = new App()
  document.body.append(app.container)

  if (initSpecialPages(app)) return

  const state = await initPersistence(app)

  console.log('Loaded data', state)

  initRealtimeSync(app, state)
}

init()
