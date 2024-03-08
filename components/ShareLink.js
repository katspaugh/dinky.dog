import { getShortHash, setHash } from '../persist.js'

export function ShareLink(label = '') {
  const container = document.createElement('label')

  const button = document.createElement('button')
  button.innerText = label
  button.style.minWidth = '93px'
  button.style.minHeight = '24px'
  container.appendChild(button)

  let timeoutId

  button.onclick = async (e) => {
    e.preventDefault()

    button.disabled = true

    const hash = await getShortHash().catch(() => '')
    if (hash) {
      setHash(hash)

      try {
        navigator.clipboard.writeText(location.href)
      } catch {
        button.disabled = false
        return
      }

      button.innerText = 'Copied!'
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        button.innerText = label
        button.disabled = false
      }, 1000)
    }
  }

  return {
    container,

    render: () => {
      return container
    },

    destroy: () => container.remove(),
  }
}
