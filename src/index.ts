import { Component } from './lib/component.js'
import { Flow } from './components/Flow.js'
//import { initDurableStream } from './lib/durable-stream.js'

async function init() {
  const appContainer = new Component('div')

  const flow = new Flow()

  flow.setProps({
    cards: [
      { id: '1', x: 100, y: 100, connections: ['2'], content: 'Hello world' },
      { id: '2', x: 500, y: 150, connections: [] },
    ],
  })

  appContainer.container.append(flow.container)
  document.body.append(appContainer.container)

  // Durable stream
  // const durableClient = await initDurableStream({
  //   subject: 'test2',
  //   clientId: navigator.userAgent,
  //   lastSequence: 0,
  //   onMessage: (msg) => {
  //     console.log('Received message', msg)

  //     if (msg.data.command && msg.data.command in flow) {
  //       flow[msg.data.command](msg.data.params)
  //     }
  //   },
  // })

  // flow.output.subscribe((props) => {
  //   if (props.command) {
  //     durableClient.publish({
  //       clientId: navigator.userAgent,
  //       command: props.command,
  //       params: props.params,
  //     })
  //   }
  // })
}

init()
