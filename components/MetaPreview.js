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
        const iframe = document.createElement('iframe')
        iframe.style.width = '100%'
        iframe.setAttribute('sandbox', '')
        iframe.src =
          'data:text/html,' +
          encodeURIComponent(`<style>* { margin: 0; }</style><img src="${image}" style="width: 100%; height: auto;">`)
        container.appendChild(iframe)
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
