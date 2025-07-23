import { signOut } from '../services/supabaseService.js'

export function Header({ showLogout = false }: { showLogout?: boolean }) {
  const onSignOut = () => {
    signOut()
  }

  return (
    <header className="Header">
      <img className="Header_logo" src="/logo.png" alt="SpaceNotes" height="30px" />
      <h1>SpaceNotes</h1>
      {showLogout && (
        <button className="Header_logout" onClick={onSignOut}>
          Sign out
        </button>
      )}
    </header>
  )
}
