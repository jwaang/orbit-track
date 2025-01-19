'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Star, Home } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function Footer() {
  const { publicKey, connected } = useWallet()
  const pathname = usePathname()

  return (
    <footer className="bg-gray-800 text-white p-4 fixed bottom-0 left-0 right-0 lg:hidden border-t border-gray-700">
      <nav>
        <ul className="flex justify-around">
          <li>
            <Link
              href="/"
              className={`flex flex-col items-center ${pathname === '/' ? 'text-purple-400' : 'hover:text-purple-300'
                }`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/trending"
              className={`flex flex-col items-center ${pathname === '/trending' ? 'text-purple-400' : 'hover:text-purple-300'
                }`}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs mt-1">Trending</span>
            </Link>
          </li>
          {publicKey && connected && <li>
            <Link
              href="/favorites"
              className={`flex flex-col items-center ${pathname === '/favorites' ? 'text-purple-400' : 'hover:text-purple-300'
                }`}
            >
              <Star className="h-6 w-6" />
              <span className="text-xs mt-1">Favorites</span>
            </Link>
          </li>}
        </ul>
      </nav>
    </footer>
  )
}

