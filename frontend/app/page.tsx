'use client'

import Link from 'next/link'
import { Orbit } from 'lucide-react'
import Ripple from "../components/ui/ripple";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { motion } from "framer-motion";
import { useWallet } from '@solana/wallet-adapter-react';
import { useIsMobile } from '../hooks/use-mobile'

export default function HomePage() {
  const { publicKey, connected } = useWallet()
  const isMobile = useIsMobile()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98]
      }
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,theme(colors.gray.900)_0%,theme(colors.purple.900)_50%,theme(colors.indigo.900)_100%)] text-white flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <div className="relative w-[100vw] h-[90vh] overflow-hidden">
          <motion.div
            className="text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-4 text-purple-400"
              variants={item}
            >
              <div className="flex items-center justify-center gap-2">
                OrbitTrack
                <Orbit className="w-14 h-14" />
              </div>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-gray-300"
              variants={item}
            >
              Track. Discover. Conquer.
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-4"
              variants={item}
            >
              <Link href="/trending">
                <ShimmerButton
                  className="shadow-2xl"
                  background="rgb(147, 51, 234)"
                  shimmerColor="#ffffff"
                  shimmerSize="0.1em"
                  shimmerDuration="2s"
                >
                  Explore
                </ShimmerButton>
              </Link>
              {isMobile && publicKey && connected && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/favorites">
                    <ShimmerButton
                      className="shadow-2xl"
                      background="rgb(55, 65, 81)"
                      shimmerColor="#ffffff"
                      shimmerSize="0.0em"
                      shimmerDuration="0s"
                    >
                      Favorites
                    </ShimmerButton>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          <Ripple mainCircleOpacity={0.4} mainCircleSize={400} />
        </div>
      </main>
      <motion.footer
        className="py-4 text-center text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p>Created by Jon 🤠</p>
      </motion.footer>
    </div>
  )
}

