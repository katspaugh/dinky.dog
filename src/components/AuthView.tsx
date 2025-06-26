import { Auth } from './Auth.js'
import { Header } from './Header.js'
import { Footer } from './Footer.js'

export function AuthView() {
  return (
    <div className="AuthView">
      <Header />
      <Auth />
      <Footer />
    </div>
  )
}
