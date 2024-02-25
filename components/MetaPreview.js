export function MetaPreview() {
  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  })

  const titleEl = document.createElement('a')
  titleEl.target = '_blank'
  Object.assign(titleEl.style, {
    display: 'block',
    margin: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  })

  return {
    container,

    render: ({ url, title = url, description, image }) => {
      container.innerHTML = ''

      titleEl.innerText = title
      titleEl.href = url
      container.appendChild(titleEl)

      if (image) {
        const img = new Image()
        img.src = image
        img.style.width = '100%'
        img.alt = description || title
        container.appendChild(img)
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
