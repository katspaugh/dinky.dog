import { ReactNode } from 'react'

type HeaderProps = {
  showLogout?: boolean
  onLogout?: () => void
  children?: ReactNode
}

export function Header({ showLogout, onLogout, children }: HeaderProps) {
  return (
    <header className="Header">
      <img src="/dinky-small.png" alt="SpaceNotes" />
      <h1>SpaceNotes</h1>
      {children}
      {showLogout && (
        <button className="Header_logout" onClick={onLogout}>
          Log out
        </button>
      )}
    </header>
  )
}
