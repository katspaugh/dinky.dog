import { Component } from '../lib/component.js'
import { Graph } from './Graph.js'
import { Edge } from './Edge.js'
import { DragCard } from './DragCard.js'
import { Editable } from './Editable.js'

type GraphNode = {
  id: string
  card: DragCard
  outEdges: Edge[]
  inEdges: Edge[]
  content: string
}

export class Flow extends Component {
  private nodes: GraphNode[] = []
  private graph: Graph
  private lastEdge: Edge | null = null
  private lastNode: GraphNode | null = null

  constructor() {
    super('div')

    this.graph = new Graph()
    this.container.append(this.graph.container)
    this.subscribeGraph()

    // Load saved nodes
    this.input.subscribe((props) => {
      props.cards.forEach((item) => {
        this.createNode({ x: item.x, y: item.y }, item.id, item.content)

        Promise.resolve().then(() => {
          if (item.connections) {
            const node = this.nodes.find((node) => node.id === item.id)

            item.connections.forEach((id) => {
              const target = this.nodes.find((node) => node.id === id)
              const edge = this.createEdge(node)
              this.connectEdge(target, edge)
            })
          }
        })
      })
    })
  }

  private subscribeGraph() {
    // Double click
    this.graph.on('dblclick', (props) => {
      this.createNode({ x: props.x, y: props.y })
    })

    // Mouse move
    this.graph.on('pointermove', (props) => {
      if (this.lastEdge) {
        this.lastEdge.input.next({ x2: props.x, y2: props.y })
      }
    })

    // Click
    this.graph.on('click', (props) => {
      if (this.lastEdge) {
        const node = this.createNode({ x: props.x, y: props.y })
        this.connectEdge(node, this.lastEdge)
        this.lastEdge = null
      }
    })

    // Escape
    this.graph.on('escape', () => {
      if (this.lastEdge) {
        this.lastEdge.destroy()
        this.lastEdge = null
      } else if (this.lastNode) {
        if (confirm('Are you sure you want to delete this card?')) {
          this.removeNode(this.lastNode)
        }
      }
    })
  }

  private createEdge(node: GraphNode) {
    const rect = this.graph.getOffset()
    const { x, y } = node.card.getConnectionPoint()
    const x1 = x - rect.left
    const y1 = y - rect.top
    const edge = new Edge({ x1, y1, x2: x1, y2: y1 })
    this.graph.input.next({ edge: edge.container })
    node.outEdges.push(edge)
    return edge
  }

  private connectEdge(node: GraphNode, edge: Edge) {
    const rect = this.graph.getOffset()
    const { x, y } = node.card.getConnectionPoint()
    edge.input.next({ x2: x - rect.left, y2: y - rect.top })
    node.inEdges.push(edge)
  }

  private adjustEdges(node: GraphNode) {
    const rect = this.graph.getOffset()
    const { x, y } = node.card.getConnectionPoint()
    node.inEdges.forEach((edge) => {
      edge.input.next({ x2: x - rect.left, y2: y - rect.top })
    })
    node.outEdges.forEach((edge) => {
      edge.input.next({ x1: x - rect.left, y1: y - rect.top })
    })
  }

  private onConnectorClick(node: GraphNode) {
    this.lastEdge = this.createEdge(node)
  }

  private onDrag(node: GraphNode, dx: number, dy: number) {
    node.outEdges.forEach((edge) => {
      const { x1, y1 } = edge.output.get().position
      edge.input.next({ x1: x1 + dx, y1: y1 + dy })
    })
    node.inEdges.forEach((edge) => {
      const { x2, y2 } = edge.output.get().position
      edge.input.next({ x2: x2 + dx, y2: y2 + dy })
    })
  }

  private onNodeClick(node: GraphNode) {
    if (this.lastEdge) {
      this.connectEdge(node, this.lastEdge)
      this.lastEdge = null
    } else {
      this.lastNode = node
    }
  }

  private createNode({ x, y }, id = Math.random().toString(32), content = '') {
    const card = new DragCard({ x, y })
    const node = { id, card, outEdges: [], inEdges: [], content }

    card.on('connector', () => this.onConnectorClick(node))

    card.on('dragstart', () => this.adjustEdges(node))

    card.on('drag', (props) => this.onDrag(node, props.dx, props.dy))

    card.on('click', () => this.onNodeClick(node))

    // Text editor
    const editable = new Editable({ content })
    editable.output.subscribe((props) => (node.content = props.content))
    node.card.input.next({ content: editable.container })

    this.graph.input.next({ card: card.container })
    this.nodes.push(node)
    this.lastNode = node

    return node
  }

  private removeNode(node: GraphNode) {
    node.card.destroy()
    node.outEdges.forEach((edge) => edge.destroy())
    node.inEdges.forEach((edge) => edge.destroy())
    this.nodes = this.nodes.filter((item) => item !== node)
  }
}
