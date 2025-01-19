import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { Token } from '../../types/Token'
import { Toaster } from '../../components/ui/toaster'

export default function Layout({ children, favorites }: { children: React.ReactNode, favorites?: Token[] }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <div className="flex-grow flex">
        <main className="flex-grow container mx-auto px-4 mb-16 lg:mb-0">
          {children}
        </main>
        <Toaster />
        {favorites && <Sidebar favorites={favorites} />}
      </div>
      <Footer />
    </div>
  )
}
