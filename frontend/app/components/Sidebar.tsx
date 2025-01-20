'use client'

import { Token } from '../../types/Token'
import Image from 'next/image'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@apollo/client'
import { FAVORITES_BY_USER } from '../graphql/queries/favoritesByUser'
import { REMOVE_FAVORITE_TOKEN } from '../graphql/mutations/removeFavoriteToken'
import { motion, AnimatePresence } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "../../components/ui/button"
import { useFavorite } from '../../hooks/use-favorite'

export default function Sidebar() {
  const { publicKey } = useWallet()
  const { favoritedTokensData, favoritedTokensLoading } = useFavorite()

  const [removeFavoriteToken] = useMutation(REMOVE_FAVORITE_TOKEN, {
    refetchQueries: [
      {
        query: FAVORITES_BY_USER,
        variables: { publicKey: publicKey?.toString() }
      }
    ]
  })

  const formatPrice = (price: number) => {
    if (!price) {
      return 'N/A'
    }
    if (price > 1) {
      return `$${price.toFixed(2).toLocaleString()}`
    }
    return `$${price.toFixed(6).toLocaleString()}`
  }

  const handleUnfavorite = async (tokenAddress: string) => {
    try {
      await removeFavoriteToken({ variables: { tokenAddress, publicKey: publicKey?.toString() } })
    } catch (error) {
      console.error('Error toggling favorite status:', error)
    }
  }

  return (
    <div className="w-64 bg-gray-800 hidden lg:block right-0 top-0 bottom-0 overflow-y-auto border-l border-gray-700">
      <h2 className="text-xl font-bold p-4 sticky top-0 bg-gray-800 py-2 text-purple-400">Your Favorites 🚀</h2>
      {favoritedTokensLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700 h-[calc(100vh-126px)] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {favoritedTokensData?.getMultipleTokens?.length > 0 ? favoritedTokensData.getMultipleTokens.map((token: Token) => (
              <motion.li
                key={token.address}
                className="p-4 hover:bg-gray-700"
                initial={{ opacity: 1, height: "auto" }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  transition: { duration: 0.2 }
                }}
                layout
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    {token.icon && token.icon !== "missing.png" ? <Image
                      src={token.icon}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className="mr-2 rounded-full"
                    /> : <QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-gray-400" />}
                    <span className="font-semibold">{token.symbol}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleUnfavorite(token.address)}>
                    <StarIcon className="w-6 h-6 text-purple-400 fill-current" />
                  </Button>
                </div>
                <div className="flex mt-1 justify-between">
                  <span className="text-sm">{formatPrice(token.price)}</span>
                  <span className={`text-sm ml-2 ${token?.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token?.priceChange?.toFixed(2)}%
                  </span>
                </div>
              </motion.li>
            )) : (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center text-gray-400 py-4">{publicKey ? 'No tokens favorited' : 'Connect your wallet to start favoriting tokens! ☝️'}</div>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

