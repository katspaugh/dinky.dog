import { useCallback, useEffect, useState } from 'react'
import { getSavedStates } from '../lib/persist.js'
import { makeUrl } from '../lib/url.js'
import { LockButton } from './LockButton.js'
import { supabase } from '../lib/supabase.js'

const fixedLinks = [
  { title: 'About', url: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
  { title: 'Privacy', url: makeUrl('074505b43d5c0b97', 'privacy') },
  { title: 'Terms', url: makeUrl('43a7a9fa13bb3d0c', 'terms') },
  { title: 'GitHub', url: 'https://github.com/katspaugh/dinky.dog' },
]

type SidebarProps = {
  isLocked?: boolean
  title?: string
  onLockChange: (isLocked: boolean) => void
  onTitleChange: (title: string) => void
}

export function Sidebar({ isLocked, title, onLockChange, onTitleChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [docs, setDocs] = useState([])

  const toggleDrawer = useCallback((e) => {
    e.stopPropagation()
    setIsOpen((open) => !open)
    setDocs(getSavedStates())
  }, [])

  const stopPropagation = useCallback((e) => e.stopPropagation(), [])

  const renderLink = useCallback(
    (doc) => (
      <li key={doc.url}>
        <a href={doc.url}>
          {doc.title}
        </a>
      </li>
    ),
    [],
  )

  const onInput = useCallback((e) => {
    const value = e.target.value
    onTitleChange(value)
  }, [onTitleChange])

  const toggleButton = (
    <button className="Sidebar_button" onClick={toggleDrawer}>
      <img src="/dinky-small.png" alt="Dinky Dog" />
    </button>
  )

  const divider = <hr />

  useEffect(() => {
    const onClickOutside = () => {
      setIsOpen(false)
    }
    document.body.addEventListener('click', onClickOutside)
    return () => {
      document.body.removeEventListener('click', onClickOutside)
    }
  }, [])

  const onSignOut = useCallback(() => {
    supabase.auth.signOut()
  }, [])

  return (
    <aside className={`Sidebar${isLocked ? ' Sidebar_locked' : ''}`}>
      <input onInput={onInput} value={title ?? ''} />

      {toggleButton}

      <div
        className="Sidebar_drawer"
        style={{ transform: `translateX(${isOpen ? 0 : '100%'})` }}
        onClick={stopPropagation}
      >
        <h1>Dinky Dog</h1>

        {toggleButton}

        {divider}

        <div className="Sidebar_actions">
          <LockButton isLocked={isLocked} onLockChange={onLockChange} />
        </div>

        <ul>
          {renderLink({ url: makeUrl(Math.random().toString(36).slice(2)), title: '＋New' })}
        </ul>

        <ul className="Sidebar_links">
          {docs.map((doc) => renderLink({ url: makeUrl(doc.id, doc.title), title: doc.title }))}
        </ul>

        {divider}

        <ul>
          {fixedLinks.map(renderLink)}
        </ul>

        <button className="Sidebar_logout" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  )
}
