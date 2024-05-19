import { Component } from '../lib/component.js'
import { Graph } from './Graph.js'
import { Edge } from './Edge.js'
import { DragCard } from './DragCard.js'
import { Editable } from './Editable.js'

export class Flow extends Component {
  private nodes: Array<{ id: string; card: DragCard; outEdges: Edge[]; inEdges: Edge[] }> = []

  constructor() {
    super('div')

    const graph = new Graph()
    let lastEdge: Edge | null = null

    const createEdge = (node) => {
      const edge = new Edge()
      const rect = graph.getOffset()
      const { x, y } = node.card.getConnectionPoint()
      const x1 = x - rect.left
      const y1 = y - rect.top
      edge.input.next({ x1, y1, x2: x1, y2: y1 })
      graph.input.next({ edge: edge.container })
      node.outEdges.push(edge)
      return edge
    }

    const connectEdge = (node, edge) => {
      const rect = graph.getOffset()
      const { x, y } = node.card.getConnectionPoint()
      edge.input.next({ x2: x - rect.left, y2: y - rect.top })
      node.inEdges.push(edge)
    }

    const createCard = ({ x, y }, id = Math.random().toString(32)) => {
      const card = new DragCard()
      card.input.next({ x, y })
      graph.input.next({ card: card.container })

      const node = { id, card, outEdges: [], inEdges: [] }

      card.output.subscribe((props) => {
        if (props.event === 'connector') {
          lastEdge = createEdge(node)
          return
        }

        if (props.event === 'drag') {
          const { dx, dy } = props
          node.outEdges.forEach((edge) => {
            const { x1, y1 } = edge.output.get()
            edge.input.next({ x1: x1 + dx, y1: y1 + dy })
          })
          node.inEdges.forEach((edge) => {
            const { x2, y2 } = edge.output.get()
            edge.input.next({ x2: x2 + dx, y2: y2 + dy })
          })
          return
        }

        if (props.event === 'click') {
          if (lastEdge) {
            connectEdge(node, lastEdge)
            lastEdge = null
          }
        }
      })

      const editable = new Editable()
      node.card.input.next({ content: editable.container })

      this.nodes.push(node)

      return node
    }

    graph.output.subscribe((props) => {
      // Double click
      if (props.event === 'dblclick') {
        createCard({ x: props.x, y: props.y })
        return
      }

      // Mouse move
      if (props.event === 'pointermove') {
        if (lastEdge) {
          lastEdge.input.next({ x2: props.x, y2: props.y })
        }
        return
      }

      // Click
      if (props.event === 'click') {
        if (lastEdge) {
          const node = createCard({ x: props.x, y: props.y })
          connectEdge(node, lastEdge)
          lastEdge = null
        }
        return
      }
    })

    this.container.append(graph.container)

    this.input.subscribe((props) => {
      props.cards.forEach((item) => {
        createCard({ x: item.x, y: item.y }, item.id)

        Promise.resolve().then(() => {
          if (item.connections) {
            const node = this.nodes.find((node) => node.id === item.id)

            item.connections.forEach((id) => {
              const target = this.nodes.find((node) => node.id === id)
              const edge = createEdge(node)
              connectEdge(target, edge)
            })
          }
        })
      })
    })
  }
}
