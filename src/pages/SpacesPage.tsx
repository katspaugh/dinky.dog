import { Spaces } from '../components/Spaces.js'
import { RecentSpaces } from '../components/RecentSpaces.js'
import { Header } from '../components/Header.js'
import { Footer } from '../components/Footer.js'

export function SpacesPage() {
  return (
    <div className="SpacesView">
      <Header showLogout />
      <main className="SpacesView_main">
        <RecentSpaces />
        <Spaces />
      </main>
      <Footer />
    </div>
  )
}
