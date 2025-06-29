import { Auth } from '../components/Auth.js'
import { Header } from '../components/Header.js'
import { Footer } from '../components/Footer.js'

export function AuthPage() {
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
