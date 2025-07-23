import { useEffect, useState } from 'react'
import { makeUrl } from '../lib/url.js'
import { getRecentSpaces } from '../lib/recent-spaces.js'
import type { RecentSpace } from '../lib/recent-spaces.js'

export function RecentSpaces() {
  const [spaces, setSpaces] = useState<RecentSpace[]>([])

  useEffect(() => {
    setSpaces(getRecentSpaces().slice(0, 3))
  }, [])

  if (spaces.length === 0) return null

  return (
    <div className="RecentSpaces">
      <h2>Recent spaces</h2>
      <div className="Spaces_grid">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="SpaceCardWrapper"
            style={{ backgroundColor: space.backgroundColor }}
          >
            <a className="SpaceCard" href={makeUrl(space.id, space.title)}>
              {space.title || 'Untitled'}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
