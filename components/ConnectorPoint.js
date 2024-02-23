export function ConnectorPoint() {
  const button = document.createElement('button')

  return {
    container: button,

    render: ({ id, style }) => {
      button.setAttribute('id', id)
      Object.assign(button.style, style)
      return button
    },
  }
}
