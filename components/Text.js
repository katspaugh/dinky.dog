export function Text() {
  const container = document.createElement('div')
  container.contentEditable = 'true'
  container.autofocus = true
  Object.assign(container.style, {
    width: '100%',
    height: '100%',
    padding: '10px',
    margin: '-10px',
  })

  return {
    container,

    render: ({ text }) => {
      container.innerText = text
      return container
    },
  }
}
