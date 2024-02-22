import { Stream } from '../stream.js'
import { ImagePreview } from '../components/ImagePreview.js'

export function Image(src = '') {
  const component = ImagePreview()
  const stream = new Stream(src)

  const unsub = stream.subscribe((src) => {
    component.render({ src })
  })

  return {
    inputs: [stream],

    output: stream,

    serialize: () => {
      return src
    },

    render: () => {
      return component.render({ src })
    },

    destroy: () => {
      unsub()
    },
  }
}
