import { Stream } from '../utils/stream.js'
import { ImagePreview } from '../components/ImagePreview.js'
import { parseImageUrl } from '../text-transformers/index.js'

export function Image(text = '') {
  const inputStream = new Stream()
  const outputStream = new Stream(text)
  const component = ImagePreview()

  inputStream.subscribe((text) => {
    const src = parseImageUrl(text)
    outputStream.next(src)
  })

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
