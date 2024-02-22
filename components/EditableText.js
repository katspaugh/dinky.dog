export function EditableText({ onInput = null }) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100%',
    height: '100%',
    padding: '10px',
    overflow: 'auto',
  })

  if (onInput) {
    container.contentEditable = 'true'

    container.oninput = () => {
      onInput(container.innerText)
    }
  }

  return {
    container,

    render: ({ text }) => {
      if (text !== container.innerText) {
        container.innerText = text
      }
      return container
    },
  }
}
