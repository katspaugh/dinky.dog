export function ShareLink(label = '', onShare) {
  const container = document.createElement('label')

  const button = document.createElement('button')
  button.innerText = label
  container.appendChild(button)

  let timeoutId

  button.onclick = async (e) => {
    e.preventDefault()

    onShare && onShare()

    try {
      navigator.clipboard.writeText(location.href)
    } catch {
      return
    }

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

  return {
    container,

    render: () => {
      return container
    },

    destroy: () => container.remove(),
  }
}
