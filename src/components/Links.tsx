import { makeUrl } from '../lib/url.js'

export const links = [
  { title: 'About', url: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
  { title: 'Privacy', url: makeUrl('074505b43d5c0b97', 'privacy') },
  { title: 'Terms', url: makeUrl('43a7a9fa13bb3d0c', 'terms') },
  { title: 'GitHub', url: 'https://github.com/katspaugh/dinky.dog' },
]

export function Links({ direction = 'row', className = '' }: { direction?: 'row' | 'column'; className?: string }) {
  return (
    <ul className={`Links Links_${direction} ${className}`.trim()}>
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url}>{link.title}</a>
        </li>
      ))}
    </ul>
  )
}
