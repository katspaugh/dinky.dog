import { Spaces } from '../components/Spaces.js'
import { Header } from '../components/Header.js'
import { Footer } from '../components/Footer.js'

export function SpacesPage() {
  return (
    <div className="SpacesView">
      <Header showLogout />
      <main className="SpacesView_main">
        <Spaces />
      </main>
      <Footer />
    </div>
  )
}
