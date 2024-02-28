import { getShortUrl } from '../persist.js'

export function ShareLink(label = '') {
  const button = document.createElement('button')
  button.innerText = label
  button.style.minWidth = '93px'
  button.style.minHeight = '24px'

  button.onclick = async (e) => {
    e.preventDefault()
    const url = await getShortUrl().catch(() => '')
    if (url) {
      navigator.clipboard.writeText(url)

      button.innerText = 'Copied!'
      setTimeout(() => {
        button.innerText = label
      }, 1000)
    }
  }

  const container = button

  return {
    container,

    render: () => {
      return container
    },

    destroy: () => container.remove(),
  }
}
