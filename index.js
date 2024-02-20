import { renderGraph } from './flow.js'
import { Sidebar } from './components/Sidebar.js'
import { Text } from './components/Text.js'
import { Image } from './components/Image.js'
import { getHashData, setHashData } from './hash.js'

async function renderApp(initialData) {
  const appContainer = document.querySelector('#app')
  const sidebar = Sidebar()
  appContainer.appendChild(sidebar.container)

  let _modules = []
  let _connections = []

  const findModule = (id) => _modules.find((m) => m.id === id)

  const createModule = ({ type, data, x, y, id = `${type}-${Date.now()}` }) => {
    let module, children

    if (type === Image.name) {
      module = Image()
      children = module.render({ src: data })
    } else {
      module = Text()
      children = module.render({ text: data })
    }

    graph.renderModule({
      id,
      x,
      y,
      label: '',
      inputsCount: 1,
      children,
    })

    return {
      ...module,
      type,
      get description() {
        return module.container.cloneNode(true)
      },
      id,
      x,
      y,
    }
  }

  const updateUrl = () => {
    const data = {
      modules: _modules.map(({ id, type, x, y }) => ({ id, type, x, y })),
      connections: _connections,
    }
    setHashData(data)
  }

  const updateConnection = (inputId, outputId, disconnect = false) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = findModule(inputModuleId)
    const outputModule = findModule(outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }
    if (disconnect) {
      _connections = _connections.filter((c) => c.from !== outputId || c.to !== inputId)
    } else {
      _connections.push({ from: outputId, to: inputId })
    }
    updateUrl()
  }

  const onConnect = (inputId, outputId) => {
    updateConnection(inputId, outputId)
  }

  const onDisconnect = (inputId, outputId) => {
    updateConnection(inputId, outputId, true)
  }

  const onAddModule = ({ x, y, id, type = 'Text', data = '' }) => {
    const mod = createModule({ x, y, id, type, data })
    _modules.push(mod)
    updateUrl()
    return mod
  }

  const onRemoveModule = (id) => {
    const module = findModule(id)
    if (!module) return
    _modules = _modules.filter((m) => m.id !== id)
    _connections = _connections.filter((c) => c.from.split('-output')[0] !== id && c.to.split('-input')[0] !== id)
    updateUrl()
  }

  const onMove = (id, x, y) => {
    const module = findModule(id)
    if (!module) return
    module.x = x
    module.y = y
  }

  const onMoveEnd = () => {
    updateUrl()
  }

  const onModuleSelect = (id) => {
    const module = findModule(id)
    sidebar.render(module)
  }

  const graph = renderGraph({
    appContainer,
    onConnect,
    onDisconnect,
    onAddModule,
    onRemoveModule,
    onMove,
    onMoveEnd,
    onModuleSelect,
  })

  _modules = await Promise.all(initialData.modules.map(onAddModule))

  initialData.connections.forEach((cable) => {
    const fromEl = document.querySelector(`#${cable.from}`)
    const toEl = document.querySelector(`#${cable.to}`)
    graph.renderPatchCable(fromEl, toEl)
    onConnect(cable.to, cable.from)
  })

  // Make the app container a drop zone for images
  appContainer.addEventListener('drop', (e) => {
    e.preventDefault()
    const x = e.clientX - 50
    const y = e.clientY - 25
    const file = e.dataTransfer.files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onAddModule({ x, y, type: Image.name, data: e.target.result, id: `image-${Date.now()}` })
      }
      reader.readAsDataURL(file)
    }
  })
  appContainer.addEventListener('dragover', (e) => e.preventDefault())
}

// Initialize app
renderApp({
  modules: [
    { id: 'text-0', x: 600, y: 50, type: 'Text', data: 'Hello' },
    { id: 'text-1', x: 800, y: 150, type: 'Text', data: 'world' },
  ],
  connections: [{ from: 'text-0-output', to: 'text-1-input-0' }],
})
