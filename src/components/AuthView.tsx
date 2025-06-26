import { Auth } from './Auth.js'
import { Header } from './Header.js'
import { Footer } from './Footer.js'

export function AuthView() {
  return (
    <div className="AuthView">
      <Header />
      <main className="AuthView_main">
        <Auth />
      </main>
      <Footer />
    </div>
  )
}
