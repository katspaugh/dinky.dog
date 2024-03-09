import { Stream } from '../utils/stream.js'
import { parseImageUrl } from '../text-transformers/index.js'
import { ImagePreview } from '../components/ImagePreview.js'

export function Image(text = '') {
  const inputStream = new Stream(text)
  const outputStream = new Stream()
  const component = ImagePreview()

  inputStream.subscribe((text) => {
    const url = parseImageUrl(src)
    if (url) {
      outputStream.next(url)
    }
  })

  outputStream.subscribe((src) => {
    component.render({ src })
  })

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
