import { useEffect, useMemo, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { randomId } from '../lib/utils.js'
import { listDocs } from '../lib/dinky-api.js'

export type SpaceInfo = { id: string; title?: string }

export function Spaces() {
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])

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
          <a
            key={space.id}
            className="SpaceCard"
            href={makeUrl(space.id, space.title)}
          >
            {space.title || 'Untitled'}
          </a>
        ))}
      </div>
    </div>
  )
}
