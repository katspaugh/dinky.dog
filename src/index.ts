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

async function saveToDatabase(flowNodes, restData) {
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
    ...restData,
    nodes,
  }

  const encData = await compressObjectToString(data)
  await saveData(data.id, encData)
}

function initSpecialPages(flow) {
  const isSpecial = location.pathname.startsWith('/privacy') || location.pathname.startsWith('/terms')

  if (isSpecial) {
    const textEl = document.getElementById('text')
    textEl.style.display = 'none'
    flow.setProps({
      nodes: {
        '1': {
          id: '1',
          content: textEl.innerHTML,
          x: 20,
          y: 20,
          width: window.innerWidth > 1000 ? window.innerWidth * 0.7 : window.innerWidth - 40,
          height: window.innerHeight - 40,
          connections: [],
        },
      },
    })
  }

  return isSpecial
}

async function initPersistence(flow, sidebar) {
  const data = await loadFromDatabase()

  if (data) {
    flow.setProps({ nodes: data.nodes, backgroundColor: data.backgroundColor })

    if (data.title) {
      sidebar.setProps({ title: data.title })
    }
  }

  const save = (restData) => {
    saveToDatabase(flow.getProps(), restData)
    saveToLocalStorage(restData)
  }

  flow.on('command', () => {
    save(data)
  })

  sidebar.on('titleChange', ({ title }) => {
    save({ ...data, title })
  })

  return data
}

async function init() {
  const appContainer = new Component('div')

  const flow = new Flow()
  const sidebar = new Sidebar()

  appContainer.container.append(flow.container)
  appContainer.container.append(sidebar.container)
  document.body.append(appContainer.container)

  if (initSpecialPages(flow)) {
    return
  }

  const data = await initPersistence(flow, sidebar)

  //initRealtimeSync(flow, data?.lastSequence)
}

init()
