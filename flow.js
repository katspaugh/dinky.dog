import { Graph } from './components/Graph.js'
import { Node } from './components/Node.js'
import { Edge } from './components/Edge.js'

export function renderGraph({
  appContainer,
  onConnect,
  onDisconnect,
  onAddModule,
  onRemoveModule,
  onMove,
  onMoveEnd,
  onModuleResize,
  onModuleSelect,
}) {
  const graph = Graph()

  let _nodes = []
  let _edges = []
  let currentMouseEdge
  let currentModule
  let currentOutput
  let currentInput

  const bboxFromMouse = (e) => {
    const { clientX, clientY } = e
    return { left: clientX, top: clientY, width: 0, height: 0 }
  }

  const onModuleClick = (node, e) => {
    if (currentModule) {
      currentModule.container.classList.remove('active')
    }
    currentModule = node
    currentModule.container.classList.add('active')
    onModuleSelect(node.id)

    const id = e.target.getAttribute('id')
    if (!id) return

    if (currentOutput) {
      currentOutput.element.classList.remove('active')
    }

    if (currentInput) {
      currentInput.element.classList.remove('active')
    }

    if (id.includes('input')) {
      const inputIndex = id.split('-input-')[1]
      currentInput = {
        element: e.target,
        input: node.inputs[inputIndex],
      }
    }

    if (id.includes('output')) {
      currentOutput = {
        element: e.target,
        output: node.output,
      }
    }

    if (currentMouseEdge) {
      _edges = _edges.filter((item) => item.edge !== currentMouseEdge.edge)
      currentMouseEdge.edge.container.remove()
      currentMouseEdge = null
    }

    if (currentInput && currentOutput) {
      api.renderPatchCable(currentOutput.element, currentInput.element)
      onConnect(currentInput.element.id, currentOutput.element.id)
      currentInput = null
      currentOutput = null
    } else {
      e.target.classList.add('active')

      if (currentInput || currentOutput) {
        currentMouseEdge = api.renderPatchCable(e.target, {
          id: 'mouse',
          getBoundingClientRect: () => bboxFromMouse(e),
        })
      }
    }
  }

  const findEdges = (inputs, output) => {
    return _edges.filter(
      (edge) =>
        inputs.includes(edge.fromEl) || inputs.includes(edge.toEl) || edge.fromEl === output || edge.toEl === output,
    )
  }

  const onGraphClick = (e) => {
    if (e.target !== graph.container) return

    const x = e.clientX - appContainer.offsetLeft
    const y = e.clientY - appContainer.offsetTop

    onAddModule({ x, y })
  }

  const updateEdges = (node) => {
    const { inputs, output } = node
    const movedEdges = findEdges(inputs, output)
    movedEdges.forEach((edge) => {
      edge.edge.render({ fromEl: edge.fromEl, toEl: edge.toEl })
    })
  }

  const onModuleDrag = (node, x, y) => {
    const { id } = node
    updateEdges(node)

    onMove(id, x, y)

    if (x < -20 || y < -20) {
      onRemoveModule(id)
      api.removeModule(id)
    }
  }

  const api = {
    renderModule: ({ id, x, y, width, height, inputsCount, label, children }) => {
      const node = Node()

      const nodeItem = {
        id,
        container: node.container,
        inputs: node.inputs,
        output: node.output,
      }
      _nodes.push(nodeItem)

      const nodeContainer = node.render({
        id,
        x,
        y,
        width,
        height,
        label,
        inputsCount,
        children,
        onClick: (e) => onModuleClick(nodeItem, e),
        onDrag: (x, y) => onModuleDrag(nodeItem, x, y),
        onDragEnd: onMoveEnd,
        onResize: () => updateEdges(nodeItem),
        onResizeEnd: (width, height) => onModuleResize(id, width, height),
      })

      graph.render({ node: nodeContainer })
    },

    renderPatchCable: (fromEl, toEl) => {
      const edge = Edge()

      graph.render({
        edge: edge.render({
          fromEl,
          toEl,
          onClick: () => {
            edge.container.remove()
            _edges = _edges.filter((item) => item.edge !== edge)
            onDisconnect(toEl.id, fromEl.id)
          },
        }),
      })

      const edgeItem = {
        fromEl,
        toEl,
        edge,
      }

      _edges.push(edgeItem)

      return edgeItem
    },

    removeModule(id) {
      const node = _nodes.find((n) => n.id === id)
      if (!node) return

      node.container.remove()
      _nodes = _nodes.filter((item) => item !== node)

      const { inputs, output } = node
      const nodeEdges = findEdges(inputs, output)

      nodeEdges.forEach((edge) => {
        edge.edge.container.remove()
        _edges.splice(_edges.indexOf(edge), 1)
      })
    },
  }

  graph.container.addEventListener('click', onGraphClick, { capture: true })
  appContainer.appendChild(graph.container)

  document.addEventListener('mousemove', (e) => {
    if (!currentMouseEdge) return
    currentMouseEdge.edge.render({
      fromEl: currentMouseEdge.fromEl,
      toEl: { ...currentMouseEdge.toEl, getBoundingClientRect: () => bboxFromMouse(e) },
    })
  })

  return api
}
