import Header from './Header'
import Footer from './Footer'
import { Toaster } from '../../components/ui/toaster'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <div className="flex-grow flex">
        <main className="flex-grow container mx-auto px-4 mb-16 lg:mb-0">
          {children}
        </main>
        <Toaster />
        <Sidebar />
      </div>
      <Footer />
    </div>
  )
}
