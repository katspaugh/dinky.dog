import { Stream } from '../utils/stream.js'
import { ImagePreview } from '../components/ImagePreview.js'

export function Image(src = '') {
  const inputStream = new Stream()
  const outputStream = new Stream()
  const component = ImagePreview()

  outputStream.subscribe((src) => {
    component.render({ src })
  })

  if (src) {
    outputStream.next(src)
  }

  return {
    input: inputStream,

    output: outputStream,

    serialize: () => outputStream.get().toString(),

    render: () => component.container,

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }
}
