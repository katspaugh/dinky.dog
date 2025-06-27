import { useEffect, useMemo, useState } from 'react'
import { makeUrl, getUrlPage, setUrlPage } from '../lib/url.js'
import { randomId } from '../lib/utils.js'
import { listDocsPage, deleteDoc } from '../lib/dinky-api.js'

export type SpaceInfo = { id: string; title?: string, backgroundColor?: string }

const ITEMS_PER_PAGE = 11

export function Spaces() {
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])
  const [page, setPage] = useState(getUrlPage())
  const [totalPages, setTotalPages] = useState(1)

  const loadSpaces = async (p: number) => {
    try {
      const { spaces, total } = await listDocsPage(p, ITEMS_PER_PAGE)
      const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
      setSpaces(spaces)
      setTotalPages(pages)
      if (p > pages) setPage(pages)
    } catch (err) {
      console.error('Error loading spaces', err)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this space?')) return
    try {
      await deleteDoc(id)
      await loadSpaces(page)
    } catch (err) {
      console.error('Error deleting space', err)
    }
  }

  useEffect(() => {
    loadSpaces(page)
  }, [page])

  useEffect(() => {
    setUrlPage(page)
  }, [page])

  const newId = useMemo(() => randomId(), [])

  return (
    <div className="Spaces">
      <div className="Spaces_grid">
        <div className="SpaceCardWrapper SpaceCardWrapper_new">
          <a className="SpaceCard" href={makeUrl(newId)}>
            ＋ New space
          </a>
        </div>

        {spaces.map((space) => (
          <div key={space.id} className="SpaceCardWrapper" style={{ backgroundColor: space.backgroundColor }}>
            <a className="SpaceCard" href={makeUrl(space.id, space.title)}>
              {space.title || 'Untitled'}
            </a>
            <button
              type="button"
              className="SpaceCard_delete"
              onClick={() => onDelete(space.id)}
            >
              ╳
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="Spaces_pagination">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
