import { renderFlow } from './flow.js'
import { Sidebar } from './components/Sidebar.js'
import { DropContainer } from './components/DropContainer.js'
import * as Operators from './operators/index.js'
import { getHashData, setHashData } from './utils/hash.js'
import { debounce } from './utils/debounce.js'

function renderApp(initialData) {
  let _sidebar
  let _flow
  let _isLocked = initialData.locked || false
  let _modules = []
  let _connections = []

  const findModule = (id) => _modules.find((m) => m.id === id)

  const createModule = ({ type = Operators.Text.name, id = `${type}-${Date.now()}`, ...moduleData }) => {
    const op = Operators[type](moduleData.data)
    const container = op.render()

    _flow.renderModule({
      id,
      x: moduleData.x,
      y: moduleData.y,
      width: moduleData.width,
      height: moduleData.height,
      background: moduleData.background,
      inputsCount: op.inputs.length,
      children: container,
    })

    op.output.subscribe(updateUrl)

    return {
      ...moduleData,
      type,
      id,
      operator: op,
    }
  }

  let _wasLocked
  const updateUrl = debounce(() => {
    if (_isLocked && _wasLocked) return
    _wasLocked = _isLocked

    // Serialize the list of modules and connections
    const data = {
      modules: _modules.map(({ operator, ...moduleData }) => {
        const serializedData = { ...moduleData }
        if (serializedData.type === Operators.Text.name) {
          delete serializedData.type
        }
        const data = operator.serialize()
        if (data !== undefined) {
          serializedData.data = data
        }
        return serializedData
      }),
      connections: _connections,
      locked: _isLocked,
    }

    setHashData(data)
  }, 500)

  const updateConnection = (inputId, outputId, disconnect = false) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = findModule(inputModuleId)
    const outputModule = findModule(outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }

    const output = outputModule.operator.output
    const input = inputModule.operator.inputs[inputIndex]

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

  const onAddModule = (module) => {
    const mod = createModule(module)
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

    module.operator.destroy()
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
      _sidebar.render({
        description: module.operator.output.get(),
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

  const onModuleBackgroundChange = (id, background) => {
    const module = findModule(id)
    module.background = background
    updateUrl()
  }

  const onImageDrop = (x, y, data) => {
    if (_isLocked) return
    onAddModule({ x, y, type: Operators.Image.name, data, id: `image-${Date.now()}` })
  }

  const init = async () => {
    // Initialize app container
    const appContainer = DropContainer().render({
      className: 'app',
      fileType: 'image/',
      onDrop: onImageDrop,
    })
    document.body.appendChild(appContainer)

    // Initialize flow
    _flow = renderFlow({
      isLocked: () => _isLocked,
      appContainer,
      onConnect,
      onDisconnect,
      onAddModule,
      onRemoveModule,
      onMove,
      onMoveEnd,
      onModuleSelect,
      onModuleResize,
      onModuleBackgroundChange,
    })

    // Initialize modules and connections
    {
      _modules = await Promise.all(initialData.modules.map(createModule))

      initialData.connections.forEach((cable) => {
        const fromEl = document.querySelector(`#${cable.from}`)
        const toEl = document.querySelector(`#${cable.to}`)
        _flow.renderPatchCable(fromEl, toEl)
        onConnect(cable.to, cable.from)
      })
    }

    // Initial sidebar render
    {
      _sidebar = Sidebar()
      appContainer.appendChild(
        _sidebar.render({
          isLocked: _isLocked,
          setLocked: (isLocked) => {
            _isLocked = isLocked
            updateUrl()
          },
        }),
      )
    }
  }

  init()
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
