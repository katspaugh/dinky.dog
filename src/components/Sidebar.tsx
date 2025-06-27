import { useCallback, useEffect, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { LockButton } from './LockButton.js'
import { supabase } from '../lib/supabase.js'
import { listDocs } from '../lib/dinky-api.js'
import { Links } from './Links.js'

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

    listDocs()
      .then((list) => setDocs(list))
      .catch((err) => console.error('Error loading spaces', err))
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
      <img src="/logo.png" alt="SpaceNotes" />
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
        <h1><a href="/">SpaceNotes</a></h1>

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

        <Links direction="column" />

        <button className="Sidebar_logout" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  )
}
