export function Image() {
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
    cursor: 'pointer',
  })

  container.appendChild(img)

  const onPreview = () => {
    const preview = document.createElement('img')
    Object.assign(preview.style, {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'fixed',
      zIndex: 1000,
      boxSize: 'border-box',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
    })
    document.body.appendChild(preview)
    preview.src = img.src

    const onClick = () => {
      document.body.removeChild(preview)
      document.body.removeEventListener('click', onClick)
    }
    setTimeout(() => document.body.addEventListener('click', onClick), 100)
  }

  img.onclick = onPreview

  return {
    container,

    get data() {
      return img.src
    },

    render: ({ src }) => {
      img.src = src
      return container
    },
  }
}
