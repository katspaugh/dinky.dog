import { emoji } from './emoji.js'

export function isCompleteEmoji(text: string, shortCode: string) {
  return text.endsWith(`:${shortCode}:`)
}

export function replaceEmoji(text: string, shortCode: string, emoji: string) {
  return text.replace(/:([a-z_]*):?/g, (str, match) => {
    if (shortCode.startsWith(match)) {
      return emoji
    }
    return str
  })
}

export function getMatchingEmoji(text: string) {
  const match = text.match(/(^|\s):([a-z_]*):?$/)
  if (!match) return null
  const substring = match[2]
  const matchingEntires = Object.entries(emoji).filter(([shortcode]) => shortcode.startsWith(substring))
  if (!matchingEntires.length) return null
  return matchingEntires
}
