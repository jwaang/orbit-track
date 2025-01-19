'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TRENDING_POOLS } from '../graphql/queries/trendingPools'
import { useMutation, useQuery } from '@apollo/client'
import { FAVORITES_BY_USER } from '../graphql/queries/favoritesByUser'
import { GET_MULTIPLE_TOKENS } from '../graphql/queries/getMultipleTokens'
import { Token } from '../../types/Token'
import { FavoriteToken } from '../../types/FavoriteToken'
import { DataTable } from './VirtualizedDataTable'
import { ColumnDef, Row } from '@tanstack/react-table'
import { ADD_FAVORITE_TOKEN } from '../graphql/mutations/addFavoriteToken'
import { AnimatePresence } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/outline'
import { REMOVE_FAVORITE_TOKEN } from '../graphql/mutations/removeFavoriteToken'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useIsMobile } from '../../hooks/use-mobile'
import { useToast } from "../../hooks/use-toast"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

const API_LIMIT = 10

export default function TokenTable({ publicKey, isFavorites }: { publicKey: string, isFavorites?: boolean }) {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [page, setPage] = useState(1)
  const [allTokens, setAllTokens] = useState<Token[]>([])
  const [search, setSearch] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { data, loading, fetchMore } = useQuery(TRENDING_POOLS, {
    variables: { page: 1 },
    skip: isFavorites
  })

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

  const { data: favoritesByUserData } = useQuery(FAVORITES_BY_USER, {
    variables: { publicKey },
    skip: !publicKey
  })

  const { data: favoritedTokensData } = useQuery(GET_MULTIPLE_TOKENS, {
    variables: { tokenAddresses: favoritesByUserData?.favoritesByUser?.map((fav: FavoriteToken) => fav.tokenAddress) || [] },
    skip: !favoritesByUserData?.favoritesByUser?.length
  })

  useEffect(() => {
    // Update allTokens state when initial data loads - this sets the table data
    if (isFavorites) {
      setAllTokens(favoritedTokensData?.getMultipleTokens || [])
    } else if (data?.trendingPools.pools) {
      setAllTokens(data.trendingPools.pools)
    }
  }, [data, favoritedTokensData, isFavorites])

  const favoritedTokens = favoritesByUserData?.favoritesByUser?.map(
    (favorite: FavoriteToken) => favorite.tokenAddress
  ) || []

  const handleFavoriteClick = async (address: string, isFavorited: boolean) => {
    if (favoritedTokens.length >= 30) {
      toast({
        title: "You can only have 30 favorites",
        description: "Please remove some favorites to add a new one",
      })
      return
    }
    try {
      const mutation = isFavorited ? removeFavoriteToken : addFavoriteToken
      await mutation({ variables: { tokenAddress: address, publicKey } })
    } catch (error) {
      console.error('Error toggling favorite status:', error)
    }
  }

  const filteredTokens = allTokens
    .filter((token: Token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase())
    )

  const formatPrice = (price: number) => {
    if (!price) {
      return 'N/A'
    }
    if (price > 1) {
      return `$${price.toFixed(2).toLocaleString()}`
    }
    return `$${price.toFixed(6).toLocaleString()}`
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: ({ row }) => {
        const symbol = row.getValue("symbol")
        const icon = row.original.icon
        return (
          <div className="whitespace-nowrap">
            <div className="flex items-center">
              {icon && icon !== "missing.png" ? (
                <Image src={icon as string} alt={symbol as string} width={24} height={24} className="mr-2 rounded-full" />
              ) : (
                <QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-gray-400" />
              )}
              <span className="font-medium">{symbol as string}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {formatPrice(row.getValue("price"))}
        </div>
      ),
    },
    {
      accessorKey: "priceChange",
      header: "24h Change",
      cell: ({ row }) => {
        const priceChange = row.getValue("priceChange") as number
        return (
          <div className={`whitespace-nowrap ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange ? `${priceChange.toFixed(2)}%` : 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "marketCap",
      header: "Market Cap",
      cell: ({ row }) => {
        const marketCap = row.getValue("marketCap") as number
        return (
          <div className="whitespace-nowrap">
            {marketCap ? `$${marketCap.toLocaleString()}` : 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "volume",
      header: "Volume (24h)",
      cell: ({ row }) => {
        const volume = row.getValue("volume") as number
        return (
          <div className="whitespace-nowrap">
            {volume ? `$${volume.toLocaleString()}` : 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("address") as string
        return (
          <div className="whitespace-nowrap">
            <Button variant="link" size="sm" onClick={() => window.open(`https://solscan.io/token/${address}`, '_blank')} className="text-purple-400 hover:text-purple-300">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </Button>
          </div>
        )
      }
    },
    ...(publicKey ? [{
      accessorKey: "favorite",
      header: "Favorite",
      enableSorting: false,
      cell: ({ row }: { row: Row<Token> }) => {
        const address = row.getValue("address")
        const isFavorited = favoritedTokens.includes(address)
        return <>
          {publicKey &&
            <div className="whitespace-nowrap">
              <Button variant="ghost" size="icon" onClick={() => handleFavoriteClick(address as string, isFavorited)} className="relative">
                <AnimatePresence presenceAffectsLayout={false}>
                  {isFavorited && (
                    <motion.div
                      key={`favorited-${row.getValue("address")}`}
                      initial={false}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute"
                    >
                      <StarIcon className="w-6 h-6 text-purple-400 fill-current" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={false}
                  animate={{ rotate: isFavorited ? 360 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Button variant="ghost" size="icon">
                    <StarIcon className={`w-6 h-6 ${isFavorited ? 'text-purple-400 fill-current' : 'text-gray-400 group-hover:text-purple-300'}`} />
                  </Button>
                </motion.div>
              </Button>
            </div>
          }
        </>
      }
    }] : [])
  ];

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 bg-gray-900 z-10 p-4 -mx-4">
        <Input
          type="text"
          placeholder="Search by symbol or address"
          className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DataTable
              columns={columns}
              data={filteredTokens}
              height={`calc(100vh - ${isMobile ? '225px' : '155px'})`}
              isLoading={loading || isLoadingMore}
              trendingPools={isFavorites ? null : data?.trendingPools}
              onLoadMore={() => {
                if (page === API_LIMIT - 1) {
                  toast({
                    title: "You're all caught up! 🎉",
                    description: "You've seen all the available tokens for now. Check back later for updates!",
                  })
                } else if (page < API_LIMIT) {
                  const nextPage = page + 1;
                  setIsLoadingMore(true);
                  setPage(nextPage);
                  fetchMore({
                    variables: { page: nextPage },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return {
                        trendingPools: {
                          ...fetchMoreResult.trendingPools,
                          pools: [
                            ...prev.trendingPools.pools,
                            ...fetchMoreResult.trendingPools.pools
                          ]
                        }
                      };
                    }
                  }).then(() => {
                    setIsLoadingMore(false);
                  });
                }
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

