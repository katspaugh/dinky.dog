import DurableStreamClient from 'https://esm.sh/durable-stream-client'

const PROD_HOST = 'dinky.dog'
const API_URL = 'durable_stream.katspaugh.workers.dev'
const DEV_API_URL = 'localhost:8787'

// Initialize the client
export async function initDurableStream(subject: string) {
  const { host } = location
  const isDev = host !== PROD_HOST

  const client = new DurableStreamClient({
    host: isDev ? DEV_API_URL : API_URL,
    secure: !isDev,
    apiKey: btoa(host),
    subject,
  })

  await client.init()
  console.log('Durable Stream initialized', client)
  return client
}
