'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Orbit } from 'lucide-react'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition duration-300 ease-in-out flex items-center gap-2">
          <Orbit className="w-8 h-8" />
          OrbitTrack
        </Link>
        <div className="flex items-center">
          <WalletMultiButton className="bg-purple-500 hover:bg-purple-400 transition-colors" />
        </div>
      </div>
    </header>
  )
}
