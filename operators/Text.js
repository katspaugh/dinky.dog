import { Stream } from '../utils/stream.js'
import { EditableText } from '../components/EditableText.js'

export function Text(initialValue) {
  const inputStream = new Stream()
  const outputStream = new Stream(initialValue)

  let lastInput = initialValue

  const onInput = (value) => {
    lastInput = value
    outputStream.next(value)
  }

  const component = EditableText({ onInput })

  // Mirror output in the UI
  outputStream.subscribe((value) => {
    if (value !== lastInput) {
      component.render({ text: value })
    }
  })

  return {
    inputs: [inputStream],

    output: outputStream,

    serialize: () => outputStream.get(),

    render: ({ focus = false } = {}) => {
      const container = component.render({ text: outputStream.get() })

      // Focus the input if requested
      if (focus) {
        container.focus()
      }

      return container
    },

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      component.destroy()
    },
  }
}
