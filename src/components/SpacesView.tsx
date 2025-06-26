import { Header } from './Header.js'
import { Footer } from './Footer.js'
import { clear } from '../lib/local-storage.js'

export function SpacesView() {
  const onLogout = () => {
    clear()
    window.location.href = '/'
  }

  return (
    <div className="SpacesView">
      <Header showLogout onLogout={onLogout} />
      <main className="SpacesView_content" />
      <Footer />
    </div>
  )
}
