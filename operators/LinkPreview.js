import { Stream } from '../utils/stream.js'
import { MetaPreview } from '../components/MetaPreview.js'
import { parseUrl } from '../text-transformers/index.js'
import { debounce } from '../utils/debounce.js'
import { fetchPreview } from '../services/link-preview.js'

export function LinkPreview(initialUrl) {
  let lastUrl = ''
  const inputStream = new Stream(initialUrl)
  const outputStream = new Stream()
  const component = MetaPreview()

  const onUrlChange = debounce((url) => {
    if (!url) return

    fetchPreview(url)
      .catch(() => ({ title: url, url }))
      .then((data) => {
        if (url === lastUrl) {
          outputStream.next(data)
        }
      })
  }, 100)

  inputStream.subscribe((value) => {
    const url = parseUrl(value)
    lastUrl = url
    onUrlChange(url)
  })

  outputStream.subscribe((data) => {
    component.render(data)
  })

  const operator = {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => lastUrl,

    render: () => component.container,

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }

  return operator
}
