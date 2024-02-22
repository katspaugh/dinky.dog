import { renderGraph } from './flow.js'
import { Sidebar } from './components/Sidebar.js'
import * as Operators from './operators/index.js'
import { WIDTH, HEIGHT } from './components/Node.js'
import { getHashData, setHashData } from './hash.js'

async function renderApp(initialData) {
  const appContainer = document.querySelector('#app')
  const sidebar = Sidebar()
  appContainer.appendChild(sidebar.container)

  let _modules = []
  let _connections = []

  const findModule = (id) => _modules.find((m) => m.id === id)

  const createModule = ({
    type = Operators.Text.name,
    data,
    note,
    x,
    y,
    width,
    height,
    id = `${type}-${Date.now()}`,
  }) => {
    const module = Operators[type](data)
    const container = module.render()

    graph.renderModule({
      id,
      x,
      y,
      width,
      height,
      inputsCount: module.inputs.length,
      children: container,
    })

    // Focus
    if (container && type === Operators.Text.name && !data) {
      setTimeout(() => {
        container.focus()
      }, 100)
    }

    module.output.subscribe(updateUrl)

    return {
      ...module,
      type,
      id,
      x,
      y,
      width,
      height,
      note,
    }
  }

  let _updateUrlTimeout
  const updateUrl = () => {
    if (_updateUrlTimeout) clearTimeout(_updateUrlTimeout)
    _updateUrlTimeout = setTimeout(() => {
      const data = {
        modules: _modules.map(({ id, type, x, y, width, height, note, serialize }) => {
          const moduleData = { id, x, y, data: serialize() }
          if (type !== Text.name) {
            moduleData.type = type
          }
          if (width && height) {
            moduleData.width = width
            moduleData.height = height
          }
          if (note) {
            moduleData.note = note
          }
          return moduleData
        }),
        connections: _connections,
      }
      setHashData(data)
    }, 500)
  }

  const updateConnection = (inputId, outputId, disconnect = false) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = findModule(inputModuleId)
    const outputModule = findModule(outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }

    const output = outputModule.output
    const input = inputModule.inputs[inputIndex]

    if (disconnect) {
      _connections = _connections.filter((c) => c.from !== outputId || c.to !== inputId)
      output.disconnect(input)
    } else {
      _connections.push({ from: outputId, to: inputId })
      output.connect(input)
    }

    updateUrl()
  }

  const onConnect = (inputId, outputId) => {
    updateConnection(inputId, outputId)
  }

  const onDisconnect = (inputId, outputId) => {
    updateConnection(inputId, outputId, true)
  }

  const onAddModule = ({ id, type, data, note, x, y, width, height }) => {
    const mod = createModule({ id, type, data, note, x, y, width, height })
    _modules.push(mod)
    updateUrl()
    return mod
  }

  const onRemoveModule = (id) => {
    const module = findModule(id)
    if (!module) return

    _connections
      .filter((c) => c.from.split('-output')[0] === id || c.to.split('-input')[0] === id)
      .forEach((c) => {
        onDisconnect(c.to, c.from)
      })

    module.destroy()
    _modules = _modules.filter((m) => m.id !== id)
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
    if (module) {
      sidebar.render({
        description: module.output.get(),
        note: module.note,
        onNoteEdit: (note) => {
          module.note = note
          updateUrl()
        },
      })
    }
  }

  const onModuleResize = (id, width, height) => {
    const module = findModule(id)
    module.width = width
    module.height = height
    updateUrl()
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
    onModuleResize,
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
    const x = e.clientX - WIDTH / 2
    const y = e.clientY - HEIGHT / 2
    const file = e.dataTransfer.files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onAddModule({ x, y, type: Operators.Image.name, data: e.target.result, id: `image-${Date.now()}` })
      }
      reader.readAsDataURL(file)
    }
  })
  appContainer.addEventListener('dragover', (e) => e.preventDefault())
}

// Initialize app
getHashData().then((data) => {
  renderApp(
    data || {
      modules: [
        { id: 'text-0', x: 600, y: 50, data: 'Hello' },
        { id: 'text-1', x: 800, y: 150, data: 'world' },
      ],
      connections: [{ from: 'text-0-output', to: 'text-1-input-0' }],
    },
  )
})
