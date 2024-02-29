import DurableStreamClient from 'https://esm.sh/durable-stream-client'

// Initialize the client
export async function initDurableStream(subject) {
  const { host } = location

  const client = new DurableStreamClient({
    //host: '<worker-name>.voxo.workers.dev',
    host: 'localhost:8787',
    secure: !host.startsWith('localhost:'),
    apiKey: btoa(host),
    subject,
  })

  await client.init()
  console.log('Durable Stream Client initialized', client)
  return client
}
