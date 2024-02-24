export function ImagePreview() {
  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  })

  const img = document.createElement('img')
  Object.assign(img.style, {
    display: 'block',
    width: '100%',
    height: 'auto',
  })

  container.appendChild(img)

  return {
    container,

    render: ({ src }) => {
      img.src = src
      return container
    },

    destroy: () => container.remove(),
  }
}
