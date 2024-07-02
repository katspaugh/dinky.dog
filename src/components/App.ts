import { Component } from '../lib/component.js'
import { Flow, type FlowEvents } from './Flow.js'
import { Sidebar, type SidebarEvents } from '../components/Sidebar.js'

export type NodeProps = {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  background?: string
}

export type EdgeProps = {
  fromNode: string
  toNode: string
}

export type AppProps = {
  id: string
  nodes: NodeProps[]
  edges: EdgeProps[]
  title?: string
  backgroundColor?: string
  lastSequence: number
  peers?: string[]
}

type AppEvents = FlowEvents & SidebarEvents & {}

export class App extends Component<AppProps, AppEvents> {
  private flow: Flow
  private sidebar: Sidebar

  constructor() {
    const flow = new Flow()
    const sidebar = new Sidebar()

    super(
      'div',
      {
        style: {
          width: '100vw',
          height: '100vh',
        },
      },
      [flow.container, sidebar.container],
    )

    this.flow = flow
    this.sidebar = sidebar

    flow.on('command', (params) => {
      this.emit('command', params)
    })

    sidebar.on('titleChange', (params) => {
      this.emit('titleChange', params)
    })

    sidebar.on('backgroundColorChange', (params) => {
      flow.setProps(params)
      this.emit('backgroundColorChange', params)
    })

    this.on('destroy', () => {
      flow.destroy()
      sidebar.destroy()
    })
  }

  getProps() {
    return {
      ...this.props,
      ...this.flow.getProps(),
    }
  }

  private getPeerList() {
    const { peers } = this.props
    return peers?.map((peer) => {
      const [name, emoji] = peer.split('-')
      return { name, emoji }
    })
  }

  setProps(props: Partial<AppProps>) {
    super.setProps(props)

    const { nodes, edges, title, backgroundColor } = this.props
    this.flow.setProps({ nodes, edges, backgroundColor })
    this.sidebar.setProps({ title, backgroundColor, peers: this.getPeerList() })
  }

  callCommand(command: string, params: any) {
    if (command in this.flow) {
      this.flow[command](params)
    }
  }
}
