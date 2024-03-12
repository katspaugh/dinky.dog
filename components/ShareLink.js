import { makeUrl } from '../persist.js'

export function ShareLink(label = '', onShare) {
  const container = document.createElement('label')

  const button = document.createElement('button')
  button.innerText = label
  container.appendChild(button)

  let timeoutId
  const showCopied = () => {
    Object.assign(button.style, {
      minWidth: button.offsetWidth + 'px',
      minHeight: button.offsetHeight + 'px',
    })

    button.innerText = 'Copied!'
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      button.innerText = label
    }, 1000)
  }

  button.onclick = async (e) => {
    e.preventDefault()

    const id = onShare()
    const sharableUrl = makeUrl(id)

    try {
      navigator.clipboard.writeText(sharableUrl)
    } catch {
      alert(sharableUrl)
      return
    }

    showCopied()
  }

  return {
    container,

    render: () => {
      return container
    },

    destroy: () => container.remove(),
  }
}
