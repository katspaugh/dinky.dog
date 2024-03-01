import { getShortHash } from '../persist.js'

export function ShareLink(label = '') {
  const button = document.createElement('button')
  button.innerText = label
  button.style.minWidth = '93px'
  button.style.minHeight = '24px'

  button.onclick = async (e) => {
    e.preventDefault()
    const hash = await getShortHash().catch(() => '')
    if (hash) {
      location.hash = hash
      navigator.clipboard.writeText(`${location.origin}/#${hash}`)

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
