import { useCallback, useEffect, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { ForkButton } from './ForkButton.js'
import { supabase } from '../lib/supabase.js'
import { listDocsPage } from '../lib/dinky-api.js'
import { Links } from './Links.js'
import { useSession } from '@supabase/auth-helpers-react'

type SidebarProps = {
  isLocked?: boolean
  title?: string
  onFork: () => void
  onTitleChange: (title: string) => void
}

const ITEMS_PER_PAGE = 10

export function Sidebar({ isLocked, title, onFork, onTitleChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [docs, setDocs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const session = useSession()
  const userId = session?.user?.id || ''

  const loadDocs = useCallback(async (p: number) => {
    try {
      const { spaces, total } = await listDocsPage(userId, p, ITEMS_PER_PAGE)
      const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
      setDocs(spaces)
      setTotalPages(pages)
      if (p > pages) setPage(pages)
    } catch (err) {
      console.error('Error loading spaces', err)
    }
  }, [userId])

  const toggleDrawer = useCallback((e) => {
    e.stopPropagation()
    setIsOpen((open) => !open)
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
    <button className="Sidebar_toggle" onClick={toggleDrawer} />
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

  useEffect(() => {
    if (isOpen) {
      loadDocs(page)
    }
  }, [isOpen, page, loadDocs])

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
          <ForkButton onFork={onFork} />
        </div>

        <ul>
          {renderLink({ url: makeUrl(Math.random().toString(36).slice(2)), title: '＋New' })}
        </ul>

        <ul className="Sidebar_links">
          {docs.map((doc) => renderLink({ url: makeUrl(doc.id, doc.title), title: doc.title }))}
        </ul>

        {totalPages > 1 && (
          <div className="Sidebar_pagination">
            <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span>{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        )}

        {divider}

        <Links direction="column" />

        <button className="Sidebar_logout" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  )
}
