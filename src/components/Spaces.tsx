import { useEffect, useMemo, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { randomId } from '../lib/utils.js'
import { listDocs, deleteDoc } from '../lib/dinky-api.js'

export type SpaceInfo = { id: string; title?: string }

export function Spaces() {
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])

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

  const newId = useMemo(() => randomId(), [])

  return (
    <div className="Spaces">
      <div className="Spaces_grid">
        <a className="SpaceCard SpaceCard_new" href={makeUrl(newId)}>
          ＋ New space
        </a>
        {spaces.map((space) => (
          <div key={space.id} className="SpaceCardWrapper">
            <a className="SpaceCard" href={makeUrl(space.id, space.title)}>
              {space.title || 'Untitled'}
            </a>
            <button
              type="button"
              className="SpaceCard_delete"
              onClick={() => onDelete(space.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
