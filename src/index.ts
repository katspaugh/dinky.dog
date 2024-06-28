import { Component } from './lib/component.js'
import { Flow } from './components/Flow.js'
import { initDurableStream } from './lib/durable-stream.js'
import { loadData, saveData } from './lib/database.js'
import { compressObjectToString, decompressStringToObject } from './lib/compress.js'
import { Sidebar } from './components/Sidebar.js'
import { getClientId, getUrlId, saveToLocalStorage } from './lib/persist.js'

async function initRealtimeSync(flow: Flow, lastSequence = 0) {
  const clientId = getClientId()

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

async function loadFromDatabase() {
  const encData = await loadData(getUrlId())
  const data = await decompressStringToObject(encData)

  console.log('Loaded data', data)

  // @ts-ignore
  const nodes = Object.entries(data.nodes).reduce((acc, [key, value]: any) => {
    acc[key] = {
      id: key,
      content: value.data.operatorData,
      x: value.props.x,
      y: value.props.y,
      width: value.props.width,
      height: value.props.height,
      background: value.props.background,
      connections: value.connections?.map((item) => item.inputId) || [],
    }
    return acc
  }, {})

  return { ...data, nodes }
}

async function saveToDatabase(flowNodes, oldData) {
  const nodes = Object.entries(flowNodes).reduce((acc, [key, value]: any) => {
    acc[key] = {
      data: {
        operatorData: value.content,
      },
      props: {
        x: value.x,
        y: value.y,
        width: value.width,
        height: value.height,
        background: value.background,
      },
      connections: value.connections.map((inputId) => ({ inputId })),
    }
    return acc
  }, {})

  const data = {
    ...oldData,
    nodes,
  }

  const encData = await compressObjectToString(data)
  await saveData(data.id, encData)
}

async function init() {
  const appContainer = new Component('div')

  const flow = new Flow()
  const sidebar = new Sidebar()

  appContainer.container.append(flow.container)
  appContainer.container.append(sidebar.container)
  document.body.append(appContainer.container)

  const data = await loadFromDatabase()

  if (data) {
    flow.setProps({ nodes: data.nodes, backgroundColor: data.backgroundColor })

    if (data.title) {
      document.title = `Dinky Dog —— ${data.title}`
    }
  }

  flow.on('command', () => {
    saveToDatabase(flow.getProps(), data)
    saveToLocalStorage(data)
  })

  //initRealtimeSync(flow, data?.lastSequence)
}

init()
