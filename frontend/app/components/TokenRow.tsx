import Image from 'next/image'
import { useEffect, useState } from 'react'
import { StarIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Token } from '../../types/Token'
import { useMutation } from '@apollo/client'
import { ADD_FAVORITE_TOKEN } from '../graphql/mutations/addFavoriteToken'
import { REMOVE_FAVORITE_TOKEN } from '../graphql/mutations/removeFavoriteToken'
import { FAVORITES_BY_USER } from '../graphql/queries/favoritesByUser'
import { motion, AnimatePresence } from 'framer-motion'

export default function TokenRow({ token, publicKey }: { token: Token, publicKey: string }) {
  const [isFavorited, setIsFavorited] = useState(token.isFavorited)
  const [addFavoriteToken] = useMutation(ADD_FAVORITE_TOKEN, {
    refetchQueries: [
      {
        query: FAVORITES_BY_USER,
        variables: { publicKey }
      }
    ],
  })
  const [removeFavoriteToken] = useMutation(REMOVE_FAVORITE_TOKEN, {
    refetchQueries: [
      {
        query: FAVORITES_BY_USER,
        variables: { publicKey }
      }
    ]
  })

  useEffect(() => {
    setIsFavorited(token.isFavorited)
  }, [token.isFavorited])

  const handleFavoriteClick = async () => {
    // optimistic update - will revert if error
    try {
      const mutation = isFavorited ? removeFavoriteToken : addFavoriteToken
      setIsFavorited(!isFavorited)
      await mutation({ variables: { tokenAddress: token.address, publicKey } })
    } catch (error) {
      setIsFavorited(isFavorited)
      console.error('Error toggling favorite status:', error)
    }
  }

  const formatPrice = (price: number) => {
    if (!price) {
      return 'N/A'
    }
    if (price > 1) {
      return `$${price.toFixed(2).toLocaleString()}`
    }
    return `$${price.toFixed(6).toLocaleString()}`
  }

  return (
    <tr className="hover:bg-gray-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {token.icon && token.icon !== "missing.png" ? (
            <Image src={token.icon} alt={token.symbol} width={24} height={24} className="mr-2 rounded-full" />
          ) : (
            <QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-gray-400" />
          )}
          <span className="font-medium">{token.symbol}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatPrice(token.price)}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {token.priceChange ? `${token.priceChange.toFixed(2)}%` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {token.marketCap ? `$${token.marketCap.toLocaleString()}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {token.volume ? `$${token.volume.toLocaleString()}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <a
          href={`https://solscan.io/token/${token.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300"
        >
          {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
        </a>
      </td>
      {publicKey && <td className="px-6 py-4 whitespace-nowrap">
        <button onClick={handleFavoriteClick} className="focus:outline-none relative">
          <AnimatePresence>
            {isFavorited && (
              <motion.div
                key="favorited"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <StarIcon className="w-6 h-6 text-purple-400 fill-current" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{ rotate: isFavorited ? 360 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <StarIcon className={`w-6 h-6 ${isFavorited ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'}`} />
          </motion.div>
        </button>
      </td>}
    </tr >
  )
}
