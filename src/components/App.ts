import { Component } from '../lib/component.js'
import { Flow, type FlowEvents } from './Flow.js'
import { Sidebar, type SidebarEvents } from '../components/Sidebar.js'
import { DinkyDataV2 } from '../lib/database.js'

export type NodeProps = {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color?: string
}

export type EdgeProps = {
  fromNode: string
  toNode: string
}

export type AppProps = DinkyDataV2 & {
  peers?: string[]
}

type AppEvents = FlowEvents & SidebarEvents & {}

export class App extends Component<AppProps, AppEvents> {
  private flow: Flow
  private sidebar: Sidebar
  private lastLocked: boolean = false

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
      [flow, sidebar],
    )

    this.flow = flow
    this.sidebar = sidebar

    flow.on('command', (params) => {
      if (this.props.isLocked) return
      this.emit('command', params)
    })

    sidebar.on('titleChange', (params) => {
      if (this.props.isLocked) return
      this.setProps(params)
      this.emit('titleChange', params)
    })

    sidebar.on('backgroundColorChange', (params) => {
      if (this.props.isLocked) return
      this.setProps(params)
      this.emit('backgroundColorChange', params)
    })

    sidebar.on('lockChange', (params) => {
      this.emit('lockChange', params)
    })
  }

  getProps(): AppProps {
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

    const { nodes, edges, title, isLocked, creator, backgroundColor } = this.props
    this.flow.setProps({ nodes, edges, isLocked, backgroundColor })
    this.sidebar.setProps({ title, backgroundColor, creator, isLocked, peers: this.getPeerList() })
  }

  callCommand(command: string, params: any) {
    if (this.props.isLocked) return

    if (command in this.flow) {
      this.flow[command](params)
    }
  }

  render() {
    if (this.props.isLocked !== this.lastLocked) {
      this.lastLocked = this.props.isLocked
      this.container.classList.toggle('locked', this.props.isLocked)
    }
  }
}
