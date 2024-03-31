import { Component, el } from '../utils/dom.js'
import { makeUrl } from '../persist.js'

export function ShareLink(label = '', onShare) {
  const button = el('button', {}, label)

  const component = Component({
    tag: 'label',
    props: {
      className: 'share-link',
    },
    children: [button],
  })

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

  return component
}
