import { Stream } from '../utils/stream.js'
import { ImagePreview } from '../components/ImagePreview.js'

export function Image(initialSrc = '') {
  let src = initialSrc
  const component = ImagePreview()
  const stream = new Stream(src)

  stream.subscribe((newSrc) => {
    src = newSrc
    component.render({ src })
  })

  return {
    inputs: [new Stream()],

    output: stream,

    serialize: () => src.toString(),

    render: () => component.render({ src }),

    destroy: () => {
      stream.destroy()
      component.destroy()
    },
  }
}
