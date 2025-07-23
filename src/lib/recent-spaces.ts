export type RecentSpace = { id: string; title?: string; backgroundColor?: string }

const KEY = 'spacenotes-recent-spaces'

export function getRecentSpaces(): RecentSpace[] {
  try {
    const json = localStorage.getItem(KEY)
    return json ? (JSON.parse(json) as RecentSpace[]) : []
  } catch {
    return []
  }
}

export function addRecentSpace(space: RecentSpace) {
  try {
    const spaces = getRecentSpaces().filter((s) => s.id !== space.id)
    spaces.unshift(space)
    localStorage.setItem(KEY, JSON.stringify(spaces.slice(0, 10)))
  } catch {
    // ignore storage errors
  }
}
