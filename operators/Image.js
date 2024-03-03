import { Stream } from '../utils/stream.js'
import { ImagePreview } from '../components/ImagePreview.js'

export function Image(src = '') {
  const inputStream = new Stream()
  const outputStream = new Stream(src)
  const component = ImagePreview()

  outputStream.subscribe((src) => {
    component.render({ src })
  })

  return {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => outputStream.get().toString(),

    render: () => component.render({ src: outputStream.get() }),

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }
}
