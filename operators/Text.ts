import { Stream } from '../utils/stream.js'
import { EditorPreview } from '../components/EditorPreview.js'
import { EditableText } from '../components/EditableText.js'

export function Text(initialValue) {
  let lastInput = ''
  const inputStream = new Stream()
  const outputStream = new Stream()

  const onInput = (value) => {
    outputStream.next(value)
  }

  const editor = EditableText({ onInput })
  const preview = EditorPreview(editor.container)

  // Mirror output in the UI
  outputStream.subscribe((value) => {
    if (value !== lastInput) {
      lastInput = value
      editor.render({ text: value })
      preview.render({ value })
    }
  })

  if (initialValue) {
    outputStream.next(initialValue)
  }

  return {
    ...preview,

    input: inputStream,

    output: outputStream,

    serialize: () => outputStream.get(),

    render: ({ focus = false } = {}) => {
      editor.render({ text: outputStream.get(), focus })
      return preview.container
    },

    destroy: () => {
      inputStream.destroy()
      outputStream.destroy()
      editor.destroy()
      preview.destroy()
    },
  }
}
