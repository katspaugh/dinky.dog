// @ts-ignore
import DurableStreamClient from 'https://esm.sh/durable-stream-client'

const PROD_HOST = 'dinky.dog'
const API_URL = 'stream.dinky.dog'
const DEV_API_URL = 'localhost:8787'

export async function initDurableStream({
  subject,
  clientId,
  lastSequence,
  onMessage,
}: {
  subject: string
  clientId: string
  lastSequence: number
  onMessage: (msg: any) => void
}) {
  const { host } = location
  const isDev = host !== PROD_HOST

  const client = new DurableStreamClient({
    host: isDev ? DEV_API_URL : API_URL,
    secure: !isDev,
    apiKey: btoa(host),
    subject,
  })

  await client.init()

  client.subscribe(lastSequence, (msg, ack) => {
    ack()

    if (msg.data.clientId !== clientId) {
      console.log('Received message', msg)
      onMessage(msg)
    }
  })

  console.log('Durable Stream initialized', client)

  return client
}
