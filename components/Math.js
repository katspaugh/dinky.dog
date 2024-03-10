import { EditableText } from '../components/EditableText.js'

export function Math() {
  const editor = EditableText({})

  return {
    container: editor.container,

    render: ({ expression = '' }) => {
      let result = NaN
      try {
        result = eval(expression)
      } catch {}

      return editor.render({ text: isNaN(result) ? '' : result.toString() })
    },

    destroy: () => {
      editor.destroy()
    },
  }
}
