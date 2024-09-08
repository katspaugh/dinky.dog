import { useCallback, useEffect, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { getSavedStates } from '../lib/persist.js'
import { makeUrl } from '../lib/url.js'

const fixedLinks = [
  { id: 'about-9315ba924c9d16e632145116d69ae72a', title: 'About' },
  { id: '074505b43d5c0b97', title: 'Privacy' },
  { id: '43a7a9fa13bb3d0c', title: 'Terms' },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [docs, setDocs] = useState([])

  const toggleDrawer = useCallback((e) => {
    e.stopPropagation()
    setIsOpen((open) => !open)
    setDocs(getSavedStates())
  }, [])

  const stopPropagation = useCallback((e) => e.stopPropagation(), [])

  const renderLink = useCallback(
    (doc) =>
      html`<li key=${doc.id}>
        <a href=${makeUrl(doc.id)}>${doc.title}</a>
      </li>`,
    [],
  )

  const toggleButton = html`<button class="Sidebar_button" onClick=${toggleDrawer}>🐾</button>`

  const divider = html`<hr />`

  useEffect(() => {
    const onClickOutside = () => {
      setIsOpen(false)
    }
    document.body.addEventListener('click', onClickOutside)
    return () => {
      document.body.removeEventListener('click', onClickOutside)
    }
  }, [])

  return html`<aside class="Sidebar">
    ${toggleButton}

    <div class="Sidebar_drawer" style=${`transform: translateX(${isOpen ? 0 : '100%'})`} onClick=${stopPropagation}>
      <h1>Dinky Dog</h1>

      ${toggleButton} ${divider}

      <ul>
        ${renderLink({ id: Math.random().toString(36).slice(2), title: '＋New' })}
      </ul>

      <ul class="Sidebar_links">
        ${docs.map(renderLink)}
      </ul>

      ${divider}

      <ul>
        ${fixedLinks.map(renderLink)}
      </ul>
    </div>
  </aside>`
}
