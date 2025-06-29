import { supabase } from '../lib/supabase.js'

export function Header({ showLogout = false }: { showLogout?: boolean }) {
  const onSignOut = () => {
    supabase.auth.signOut()
  }

  return (
    <header className="Header">
      <img src="/logo.png" alt="SpaceNotes" height="30px" />
      <h1>SpaceNotes</h1>
      {showLogout && (
        <button className="Header_logout" onClick={onSignOut}>
          Sign out
        </button>
      )}
    </header>
  )
}
