import { Spaces } from './Spaces.js'
import { Header } from './Header.js'
import { Footer } from './Footer.js'

export function SpacesView() {
  return (
    <div className="SpacesView">
      <Header showLogout />
      <Spaces />
      <Footer />
    </div>
  )
}
