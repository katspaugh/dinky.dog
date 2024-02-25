import { Stream } from '../utils/stream.js'
import { MetaPreview } from '../components/MetaPreview.js'
import { parseUrl } from '../utils/parse-text.js'
import { debounce } from '../utils/debounce.js'
import { fetchPreview } from '../services/link-preview.js'

export function LinkPreview(initialUrl) {
  let lastUrl = ''
  const inputStream = new Stream(initialUrl)
  const outputStream = new Stream()
  const component = MetaPreview()

  const unsubInput = inputStream.subscribe((value) => {
    const url = parseUrl(value)
    lastUrl = url
    onUrlChange(url)
  })

  const onUrlChange = debounce((url) => {
    if (!url) return

    fetchPreview(url)
      .then((data) => {
        if (url === lastUrl) {
          outputStream.next(data)
        }
      })
      .catch(() => {
        component.render({ title: url, url })
      })
  }, 500)

  const unsubOutput = outputStream.subscribe((data) => {
    component.render(data)
  })

  const operator = {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => lastUrl,

    render: () => component.container,

    destroy: () => {
      unsubInput()
      unsubOutput()
      component.destroy()
    },
  }

  return operator
}
