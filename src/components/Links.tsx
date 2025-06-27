export const links = [
  { title: 'About', url: '/?q=about_about-9315ba924c9d16e632145116d69ae72a' },
  { title: 'Privacy', url: '/privacy.html' },
  { title: 'Terms', url: '/terms.html' },
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
