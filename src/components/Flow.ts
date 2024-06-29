import { Component } from '../lib/component.js'
import { Graph } from './Graph.js'
import { Edge } from './Edge.js'
import { DragCard } from './DragCard.js'
import { Editable } from './Editable.js'
import { debounce, randomId } from '../lib/utils.js'

type GraphNode = {
  id: string
  connections: Array<{
    node: GraphNode
    edge: Edge
  }>
  card: DragCard
  editor: Editable
}

type NodeProps = {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  content?: string
}

type FlowProps = {
  nodes: Record<
    string,
    NodeProps & {
      connections: string[]
    }
  >
  backgroundColor?: string
}

type FlowEvents = {
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
    super('div', {
      style: {
        height: '100vh',
      },
    })

    this.graph = new Graph()
    this.container.append(this.graph.container)
    this.subscribeUiEvents()
  }

  render() {
    const { nodes, backgroundColor } = this.props

    if (backgroundColor) {
      this.container.style.backgroundColor = backgroundColor
    }

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

  // @ts-ignore
  getProps() {
    return Object.values(this.nodes).reduce((acc, node) => {
      const { id } = node
      const { x, y, background } = node.card.getProps()
      const { content, width, height } = node.editor.getProps()
      acc[id] = {
        id,
        x,
        y,
        width,
        height,
        background,
        content,
        connections: node.connections.map((item) => item.node.id),
      }
      return acc
    }, {})
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
    this.emitDebounced('command', { command: 'repositionNode', params })
  }

  private onCreateNode({ x, y }: { x: number; y: number }) {
    const id = randomId()
    const params = { x, y, id }
    const node = this.createNode(params)
    node.editor.focus()
    this.emit('command', { command: 'createNode', params })
    return node
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
    this.editNode({ id: node.id, content })
    this.emitDebounced('command', { command: 'editNode', params: { id: node.id, content } })
  }

  /* Public methods */

  public createNode({ id, width, height, content = '', ...cardProps }: NodeProps) {
    const card = new DragCard()
    card.setProps(cardProps)

    // Text editor
    const editor = new Editable()
    editor.setProps({ content, width, height })
    editor.on('input', ({ content }) => this.onEditNode(node, content))

    const node = { id, connections: [], card, editor }

    card.on('connectorClick', () => this.onConnectorClick(node))

    card.on('drag', (props) => this.onDrag(node, props.x, props.y))

    card.on('click', () => this.onNodeClick(node))

    node.card.setProps({ content: editor.container })
    this.graph.renderCard(card.container)

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

  public editNode({ id, content }: { id: string; content: string }) {
    const node = this.nodes[id]
    if (!node) return
    node.editor.setProps({ content })
  }
}
