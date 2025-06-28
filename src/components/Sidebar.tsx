import { useCallback, useEffect, useRef, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { LockButton } from './LockButton.js'
import { supabase } from '../lib/supabase.js'
import { listDocsPage } from '../lib/dinky-api.js'
import { Links } from './Links.js'

type SidebarProps = {
  isLocked?: boolean
  title?: string
  onLockChange: (isLocked: boolean) => void
  onTitleChange: (title: string) => void
}

const ITEMS_PER_PAGE = 10

export function Sidebar({ isLocked, title, onLockChange, onTitleChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [docs, setDocs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)

  const loadDocs = useCallback(async (p: number) => {
    try {
      setIsLoading(true)
      const { spaces, total } = await listDocsPage(p, ITEMS_PER_PAGE)
      const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
      setDocs((prev) => (p === 1 ? spaces : [...prev, ...spaces]))
      setTotalPages(pages)
    } catch (err) {
      console.error('Error loading spaces', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  const onScroll = useCallback(() => {
    const list = listRef.current
    if (
      list &&
      !isLoading &&
      page < totalPages &&
      list.scrollHeight - list.scrollTop - list.clientHeight < 50
    ) {
      setPage((p) => p + 1)
    }
  }, [isLoading, page, totalPages])

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
      setDocs([])
      setPage(1)
    }
  }, [isOpen])

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
          <LockButton isLocked={isLocked} onLockChange={onLockChange} />
        </div>

        <ul>
          {renderLink({ url: makeUrl(Math.random().toString(36).slice(2)), title: '＋New' })}
        </ul>

        <ul className="Sidebar_links" ref={listRef} onScroll={onScroll}>
          {docs.map((doc) => renderLink({ url: makeUrl(doc.id, doc.title), title: doc.title }))}
          {isLoading && <li className="Sidebar_loader">Loading…</li>}
        </ul>

        {divider}

        <Links direction="column" />

        <button className="Sidebar_logout" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  )
}
