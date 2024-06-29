import { Component } from '../lib/component.js'
import { debounce, randomId } from '../lib/utils.js'
import { Graph } from './Graph.js'
import { Edge } from './Edge.js'
import { DragCard, type DragCardProps } from './DragCard.js'
import { Drop } from './Drop.js'
import { uploadImage } from '../lib/upload-image.js'

type GraphNode = {
  id: string
  connections: Array<{
    node: GraphNode
    edge: Edge
  }>
  card: DragCard
}

type NodeProps = {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  background?: string
}

export type FlowProps = {
  nodes: Record<
    string,
    NodeProps & {
      connections: string[]
    }
  >
  backgroundColor?: string
}

export type FlowEvents = {
  command: {
    command: keyof Flow
    params: unknown
  }
}

export class Flow extends Component<FlowProps, FlowEvents> {
  private nodes: Record<string, GraphNode> = {}
  private graph: Graph
  private lastEdge: Edge | null = null
  private lastNode: GraphNode | null = null

  constructor() {
    const drop = new Drop()
    const graph = new Graph()

    super(
      drop.container,
      {
        style: {
          height: '100vh',
        },
      },
      [graph.container],
    )

    drop.on('drop', (props) => {
      this.onFileUpload(props)
    })

    this.on('destroy', () => {
      drop.destroy()
      graph.destroy()
    })

    this.graph = graph
    this.subscribeUiEvents()
  }

  render() {
    const { nodes, backgroundColor } = this.props

    if (backgroundColor) {
      this.container.style.backgroundColor = backgroundColor
    }

    if (Object.keys(this.nodes).length === 0) {
      Object.values(nodes).forEach((item) => {
        this.createNode(item)
      })

      requestAnimationFrame(() => {
        Object.values(nodes).forEach((item) => {
          if (item.connections) {
            item.connections.forEach((id) => {
              this.connectNodes({ from: item.id, to: id })
            })
          }
        })
      })
    }
  }

  getProps() {
    const nodes = Object.values(this.nodes).reduce((acc, node) => {
      const { id } = node
      acc[id] = {
        id,
        ...node.card.getProps(),
        connections: node.connections.map((item) => item.node.id),
      }
      return acc
    }, {})
    return { nodes, backgroundColor: this.props.backgroundColor }
  }

  private emitDebounced = debounce((event, params) => {
    this.emit(event, params)
  }, 100)

  private subscribeUiEvents() {
    // Double click
    this.graph.on('dblclick', (props) => {
      this.onCreateNode({ x: props.x, y: props.y })
    })

    // Mouse move
    this.graph.on('pointermove', (props) => {
      if (this.lastEdge) {
        this.lastEdge.setProps({ x2: props.x, y2: props.y })
      }
    })

    // Click
    this.graph.on('click', (props) => {
      if (this.lastEdge) {
        this.lastEdge.destroy()
        this.lastEdge = null

        const fromNode = this.lastNode
        const node = this.onCreateNode({ x: props.x, y: props.y })
        this.onConnectNodes(fromNode, node)
      }
    })

    // Escape
    this.graph.on('escape', () => {
      if (this.lastEdge) {
        this.lastEdge.destroy()
        this.lastEdge = null
      } else if (this.lastNode) {
        if (confirm('Are you sure you want to delete this card?')) {
          this.onRemoveNode(this.lastNode)
        }
      }
    })
  }

  private createEdge(node: GraphNode) {
    const rect = this.graph.getOffset()
    const { x, y } = node.card.getOutPoint()
    const x1 = x - rect.left
    const y1 = y - rect.top
    const edge = new Edge()
    edge.setProps({ x1, y1, x2: x1, y2: y1 })
    this.graph.renderEdge(edge.container)

    edge.on('click', () => this.onDisconnectEdge(node, edge))

    return edge
  }

  private connectEdge(node: GraphNode, edge: Edge) {
    const rect = this.graph.getOffset()
    const { x, y } = node.card.getInPoint()
    edge.setProps({ x2: x - rect.left, y2: y - rect.top })
  }

  private onConnectorClick(node: GraphNode) {
    this.lastEdge = this.createEdge(node)
    this.lastNode = node
  }

  private onNodeClick(node: GraphNode) {
    if (this.lastNode && this.lastEdge) {
      this.lastEdge.destroy()
      this.lastEdge = null
      this.onConnectNodes(this.lastNode, node)
    } else {
      this.lastNode = node
    }
  }

  private onDrag(node: GraphNode, x: number, y: number) {
    const params = { id: node.id, x, y }
    this.repositionNode(params)
  }

  private onDragEnd(node: GraphNode) {
    const { x, y } = node.card.getProps()
    const params = { id: node.id, x, y }
    this.emit('command', { command: 'repositionNode', params })
  }

  private onCreateNode({ x, y }: { x: number; y: number }) {
    const id = randomId()
    const params = { x, y, id }
    const node = this.createNode(params)
    node.card.focus()
    this.emit('command', { command: 'createNode', params })
    return node
  }

  private async onFileUpload({ x, y, file }: { x: number; y: number; file: File }) {
    const rect = this.graph.getOffset()
    const node = this.onCreateNode({ x: x - rect.left, y: y - rect.top })
    node.card.blur()

    // Local preview
    const tempUrl = URL.createObjectURL(file)
    if (tempUrl) {
      const content = `<img src="${tempUrl}" alt="${file.name}" />`
      node.card.setProps({ content })
    }

    try {
      const url = await uploadImage(file)
      tempUrl && URL.revokeObjectURL(tempUrl)
      this.updateNode({ id: node.id, content: `<img src="${url}" alt="${file.name}" />` })
    } catch (e) {
      console.error('Failed to upload image', e)
    }
  }

  private onRemoveNode(node: GraphNode) {
    const params = { id: node.id }
    this.removeNode(params)
    this.emit('command', { command: 'removeNode', params })
  }

  private onConnectNodes(fromNode: GraphNode, toNode: GraphNode) {
    this.connectNodes({ from: fromNode.id, to: toNode.id })
    this.emit('command', { command: 'connectNodes', params: { from: fromNode.id, to: toNode.id } })
  }

  private onDisconnectEdge(fromNode: GraphNode, edge: Edge) {
    const toNode = fromNode.connections.find((item) => item.edge === edge)?.node
    if (!toNode) return
    this.disconnectNodes({ from: fromNode.id, to: toNode.id })
    this.emit('command', { command: 'disconnectNodes', params: { from: fromNode.id, to: toNode.id } })
  }

  private onEditNode(node: GraphNode, content: string) {
    const params = { id: node.id, content }
    this.updateNode(params)
    this.emitDebounced('command', { command: 'updateNode', params })
  }

  private onNodeBackgroundChange(node: GraphNode, background: string) {
    const params = { id: node.id, background }
    this.updateNode(params)
    this.emit('command', { command: 'updateNode', params })
  }

  private onResize(node: GraphNode, diff?: { dx: number; dy: number }) {
    let props = node.card.getProps()
    if (props.width == null || props.height == null) {
      const size = node.card.getSize()
      props = { ...props, ...size }
    }
    const params = { id: node.id, width: null, height: null }
    if (diff) {
      params.width = Math.round(props.width + diff.dx)
      params.height = Math.round(props.height + diff.dy)
    }
    this.updateNode(params)
  }

  private onResizeEnd(node: GraphNode) {
    const props = node.card.getProps()
    const params = { id: node.id, width: props.width, height: props.height }
    this.emit('command', { command: 'updateNode', params })
  }

  /* Public methods */

  public createNode({ id, ...cardProps }: NodeProps) {
    const card = new DragCard()
    card.setProps(cardProps)

    card.on('connectorClick', () => this.onConnectorClick(node))
    card.on('drag', (params) => this.onDrag(node, params.x, params.y))
    card.on('dragend', () => this.onDragEnd(node))
    card.on('backgroundChange', ({ background }) => this.onNodeBackgroundChange(node, background))
    card.on('resize', (params) => this.onResize(node, params))
    card.on('resizeEnd', () => this.onResizeEnd(node))
    card.on('resizeReset', () => {
      this.onResize(node)
      this.onResizeEnd(node)
    })
    card.on('contentChange', ({ content }) => this.onEditNode(node, content))
    card.on('click', () => this.onNodeClick(node))

    this.graph.renderCard(card.container)

    const node = { id, connections: [], card }
    this.nodes[id] = node
    this.lastNode = node

    return node
  }

  public repositionNode({ id, x, y }: { id: string; x: number; y: number }) {
    const node = this.nodes[id]
    if (!node) return
    const oldProps = node.card.getProps()
    const dx = x - oldProps.x
    const dy = y - oldProps.y
    node.card.setProps({ x, y })

    // Adjust outgoing connections
    node.connections.forEach(({ edge }) => {
      const { x1, y1 } = edge.getProps()
      edge.setProps({ x1: x1 + dx, y1: y1 + dy })
    })

    // Adjust incoming connections
    Object.values(this.nodes).forEach((otherNode) => {
      otherNode.connections.forEach((item) => {
        if (item.node === node) {
          const { edge } = item
          const { x2, y2 } = edge.getProps()
          edge.setProps({ x2: x2 + dx, y2: y2 + dy })
        }
      })
    })
  }

  public removeNode({ id }: { id: string }) {
    const node = this.nodes[id]
    if (!node) return

    // Disconnect outgoing connections
    node.connections.forEach((item) => {
      this.disconnectNodes({ from: node.id, to: item.node.id })
    })

    // Disconnect incoming connections
    Object.values(this.nodes).forEach((otherNode) => {
      const newConnections = otherNode.connections.filter((item) => item.node !== node)
      if (newConnections !== otherNode.connections) {
        otherNode.connections.forEach((item) => {
          if (item.node === node) {
            this.disconnectNodes({ from: otherNode.id, to: node.id })
          }
        })
        otherNode.connections = newConnections
      }
    })

    node.card.destroy()

    delete this.nodes[id]
  }

  public connectNodes({ from, to }: { from: string; to: string }) {
    const fromNode = this.nodes[from]
    const toNode = this.nodes[to]
    if (!fromNode || !toNode) return

    const edge = this.createEdge(fromNode)
    this.connectEdge(toNode, edge)

    fromNode.connections.push({
      node: toNode,
      edge,
    })
  }

  public disconnectNodes({ from, to }: { from: string; to: string }) {
    const fromNode = this.nodes[from]
    const toNode = this.nodes[to]
    if (!fromNode || !toNode) return

    fromNode.connections
      .filter((item) => item.node === toNode)
      .forEach((item) => {
        item.edge.destroy()
      })
    fromNode.connections = fromNode.connections.filter((item) => item.node !== toNode)
  }

  public updateNode({ id, ...params }: { id: string } & Partial<DragCardProps>) {
    const node = this.nodes[id]
    if (!node) return
    node.card.setProps(params)
  }
}
