import { Stream } from '../utils/stream.js'
import { EditableText } from '../components/EditableText.js'
import { parseMath } from '../text-transformers/index.js'

export function Math(text = '') {
  const inputStream = new Stream(text)
  const outputStream = new Stream()
  const component = EditableText({})

  inputStream.subscribe((text) => {
    const expression = parseMath(text)
    let result = NaN
    try {
      result = eval(expression)
    } catch {}
    outputStream.next(result)
  })

  outputStream.subscribe((result) => {
    component.render({ text: String(result) })
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
