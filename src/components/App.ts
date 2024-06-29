import { Component } from '../lib/component.js'
import { Flow, type FlowProps, type FlowEvents } from './Flow.js'
import { Sidebar, type SidebarEvents } from '../components/Sidebar.js'

export type AppProps = {
  state?: {
    id: string
    nodes: FlowProps['nodes']
    title?: string
    backgroundColor?: string
    lastSequence: number
  }
}

type AppEvents = FlowEvents & SidebarEvents & {}

export class App extends Component<AppProps, AppEvents> {
  private flow: Flow
  private sidebar: Sidebar

  constructor() {
    const flow = new Flow()
    const sidebar = new Sidebar()

    super('div', {}, [flow.container, sidebar.container])

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
      state: {
        ...this.props.state,
        ...this.flow.getProps(),
      },
    }
  }

  setProps(props: AppProps) {
    super.setProps(props)

    const data = props.state
    if (data) {
      this.flow.setProps({ nodes: data.nodes, backgroundColor: data.backgroundColor })
      this.sidebar.setProps({ title: data.title, backgroundColor: data.backgroundColor })
    }
  }

  callCommand(command: string, params: any) {
    if (command in this.flow) {
      this.flow[command](params)
    }
  }
}
