export async function compressObjectToString(obj) {
  const objString = JSON.stringify(obj)
  if (typeof CompressionStream === 'undefined') {
    return window.btoa(objString)
  }

  const encoder = new TextEncoder()
  const inputData = encoder.encode(objString)

  const compressedStream = new CompressionStream('gzip')
  const writer = compressedStream.writable.getWriter()
  writer.write(inputData)
  writer.close()

  const chunks = []
  const reader = compressedStream.readable.getReader()
  let done, value
  while ((({ done, value } = await reader.read()), !done)) {
    chunks.push(value)
  }

  const concatenatedArray = new Uint8Array(chunks.reduce((acc, val) => acc + val.length, 0))
  let position = 0
  chunks.forEach((chunk) => {
    concatenatedArray.set(chunk, position)
    position += chunk.length
  })

  return window.btoa(String.fromCharCode.apply(null, concatenatedArray))
}

export async function decompressStringToObject(compressedString) {
  if (typeof DecompressionStream === 'undefined') {
    return JSON.parse(window.atob(compressedString))
  }
  const binaryString = window.atob(compressedString)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const decompressedStream = new DecompressionStream('gzip')
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })

  const decompressedReadable = readableStream.pipeThrough(decompressedStream)
  const reader = decompressedReadable.getReader()
  const chunks = []
  let done, value
  while ((({ done, value } = await reader.read()), !done)) {
    chunks.push(value)
  }

  const concatenatedArray = new Uint8Array(chunks.reduce((acc, val) => acc + val.length, 0))
  let position = 0
  chunks.forEach((chunk) => {
    concatenatedArray.set(chunk, position)
    position += chunk.length
  })

  const decoder = new TextDecoder()
  const decompressedString = decoder.decode(concatenatedArray)
  return JSON.parse(decompressedString)
}
