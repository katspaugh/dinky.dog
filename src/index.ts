import { Component } from './lib/component.js'
import { Flow } from './components/Flow.js'
import { initDurableStream } from './lib/durable-stream.js'

async function initRealtimeSync(flow: Flow) {
  const clientId = navigator.userAgent
  const lastSequence = Number(localStorage.getItem('lastSequence')) || 0

  const durableClient = await initDurableStream({
    subject: 'test5',
    lastSequence,
    onMessage: (msg) => {
      if (msg.data.clientId !== clientId) {
        console.log('Received message', msg)

        if (msg.data.command && msg.data.command in flow) {
          flow[msg.data.command](msg.data.params)
        }
      }

      localStorage.setItem('lastSequence', msg.sequence)
    },
  })

  flow.on('command', ({ command, params }) => {
    durableClient.publish({
      clientId,
      command,
      params,
    })
  })
}

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

  initRealtimeSync(flow)
}

init()
