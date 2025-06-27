import { useEffect, useMemo, useState } from 'react'
import { makeUrl, getUrlPage, setUrlPage } from '../lib/url.js'
import { randomId } from '../lib/utils.js'
import { listDocs, deleteDoc } from '../lib/dinky-api.js'

export type SpaceInfo = { id: string; title?: string, backgroundColor?: string }

const ITEMS_PER_PAGE = 12

export function Spaces() {
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])
  const [page, setPage] = useState(getUrlPage())

  const onDelete = async (id: string) => {
    if (!confirm('Delete this space?')) return
    try {
      await deleteDoc(id)
      setSpaces((old) => old.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Error deleting space', err)
    }
  }

  useEffect(() => {
    listDocs()
      .then((list) => setSpaces(list))
      .catch((err) => console.error('Error loading spaces', err))
  }, [])

  useEffect(() => {
    setUrlPage(page)
  }, [page])

  useEffect(() => {
    const total = Math.max(1, Math.ceil(spaces.length / ITEMS_PER_PAGE))
    if (page > total) {
      setPage(total)
    }
  }, [spaces, page])

  const totalPages = Math.max(1, Math.ceil(spaces.length / ITEMS_PER_PAGE))
  const pageSpaces = spaces.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  const newId = useMemo(() => randomId(), [])

  return (
    <div className="Spaces">
      <div className="Spaces_grid">
        <div className="SpaceCardWrapper SpaceCardWrapper_new">
          <a className="SpaceCard" href={makeUrl(newId)}>
            ＋ New space
          </a>
        </div>

        {pageSpaces.map((space) => (
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
    </div>
  )
}
