import { Component } from './lib/component.js'
import { Flow } from './components/Flow.js'
import { Input } from './components/Input.js'

const appContainer = new Component('div')

const flow = new Flow()

const input = new Input()
input.output.subscribe((props) => {
  console.log('Input value:', props.value)
})

flow.input.next({
  cards: [
    { id: '1', x: 100, y: 100, connections: [] },
    { id: '2', x: 500, y: 150, connections: ['1'] },
  ],
})

appContainer.container.append(input.container)
appContainer.container.append(flow.container)
document.body.append(appContainer.container)
