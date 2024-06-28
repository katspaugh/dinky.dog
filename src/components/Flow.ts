import { Component } from '../lib/component.js'
import { Graph } from './Graph.js'
import { Edge } from './Edge.js'
import { DragCard } from './DragCard.js'
import { Editable } from './Editable.js'

type GraphNode = {
  id: string
  content: string
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
  content?: string
}

type FlowProps = {
  cards: Array<
    NodeProps & {
      connections: string[]
    }
  >
}

type FlowEvents = {
  command: {
    command: keyof Flow
    params: unknown
  }
}

export class Flow extends Component<{}, FlowEvents> {
  private nodes: GraphNode[] = []
  private graph: Graph
  private lastEdge: Edge | null = null
  private lastNode: GraphNode | null = null

  constructor() {
    super('div')

    this.graph = new Graph()
    this.container.append(this.graph.container)
    this.subscribeUiEvents()
  }

  render(props: FlowProps) {
    props.cards.forEach((item) => {
      this.createNode(item)

      Promise.resolve().then(() => {
        if (item.connections) {
          const node = this.nodes.find((node) => node.id === item.id)

          item.connections.forEach((id) => {
            const target = this.nodes.find((node) => node.id === id)
            this.connectNodes(node, target)
          })
        }
      })
    })
  }

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

  private adjustEdges(node: GraphNode) {
    const rect = this.graph.getOffset()
    const fromPoint = node.card.getOutPoint()

    node.connections.forEach((item) => {
      const toPoint = item.node.card.getInPoint()

      item.edge.setProps({
        x1: fromPoint.x - rect.left,
        y1: fromPoint.y - rect.top,
        x2: toPoint.x - rect.left,
        y2: toPoint.y - rect.top,
      })
    })
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

  private onDrag(node: GraphNode, dx: number, dy: number) {
    const params = { id: node.id, dx, dy }
    this.repositionNode(params)
    this.emit('command', { command: 'repositionNode', params })
  }

  private onCreateNode({ x, y }: { x: number; y: number }) {
    const id = Math.random().toString(32).slice(2)
    const params = { x, y, id }
    const node = this.createNode(params, true)
    this.emit('command', { command: 'createNode', params })
    return node
  }

  private onRemoveNode(node: GraphNode) {
    const params = { id: node.id }
    this.removeNode(params)
    this.emit('command', { command: 'removeNode', params })
  }

  private onConnectNodes(fromNode: GraphNode, toNode: GraphNode) {
    this.connectNodes(fromNode, toNode)
    this.emit('command', { command: 'connectNodes', params: { from: fromNode.id, to: toNode.id } })
  }

  private onDisconnectEdge(fromNode: GraphNode, edge: Edge) {
    const toNode = fromNode.connections.find((item) => item.edge === edge)?.node
    if (!toNode) return
    this.disconnectNodes(fromNode, toNode)
    this.emit('command', { command: 'disconnectNodes', params: { from: fromNode.id, to: toNode.id } })
  }

  private onEditNode(node: GraphNode, content: string) {
    this.editNode(node, content)
    this.emit('command', { command: 'editNode', params: { id: node.id, content } })
  }

  /* Public methods */

  public createNode({ x, y, id, content = '' }: NodeProps, focus = false) {
    const card = new DragCard()
    card.setProps({ x, y })
    const node = { id, content, connections: [], card }

    card.on('connectorClick', () => this.onConnectorClick(node))

    card.on('dragstart', () => this.adjustEdges(node))

    card.on('drag', (props) => this.onDrag(node, props.dx, props.dy))

    card.on('click', () => {
      this.onNodeClick(node)
      editable.focus()
    })

    // Text editor
    const editable = new Editable()
    editable.setProps({ content })
    node.card.setProps({ content: editable.container })
    editable.on('input', ({ content }) => this.onEditNode(node, content))

    this.graph.renderCard(card.container)
    this.nodes.push(node)
    this.lastNode = node

    if (focus) {
      setTimeout(() => {
        editable.focus()
      }, 100)
    }

    return node
  }

  public repositionNode({ id, dx, dy }: { id: string; dx: number; dy: number }) {
    const node = this.nodes.find((node) => node.id === id)
    if (!node) return

    const cardProps = node.card.getProps()
    node.card.setProps({ x: cardProps.x + dx, y: cardProps.y + dy })

    // Adjust outgoing connections
    node.connections.forEach(({ edge }) => {
      const { x1, y1 } = edge.getProps()
      edge.setProps({ x1: x1 + dx, y1: y1 + dy })
    })

    // Adjust incoming connections
    this.nodes.forEach((otherNode) => {
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
    const node = this.nodes.find((node) => node.id === id)
    if (!node) return

    // Disconnect outgoing connections
    node.connections.forEach((item) => {
      this.disconnectNodes(node, item.node)
    })

    // Disconnect incoming connections
    this.nodes.forEach((otherNode) => {
      const newConnections = otherNode.connections.filter((item) => item.node !== node)
      if (newConnections !== otherNode.connections) {
        otherNode.connections.forEach((item) => {
          if (item.node === node) {
            this.disconnectNodes(otherNode, node)
          }
        })
        otherNode.connections = newConnections
      }
    })

    node.card.destroy()
    this.nodes = this.nodes.filter((item) => item !== node)
  }

  public connectNodes(fromNode: GraphNode, toNode: GraphNode) {
    const edge = this.createEdge(fromNode)
    this.connectEdge(toNode, edge)

    fromNode.connections.push({
      node: toNode,
      edge,
    })
  }

  public disconnectNodes(fromNode: GraphNode, toNode: GraphNode) {
    fromNode.connections
      .filter((item) => item.node === toNode)
      .forEach((item) => {
        item.edge.destroy()
      })
    fromNode.connections = fromNode.connections.filter((item) => item.node !== toNode)
  }

  public editNode(node: GraphNode, content: string) {
    node.content = content
  }
}
