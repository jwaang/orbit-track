'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TokenRow from './TokenRow'
import { motion } from 'framer-motion'
import { TRENDING_POOLS } from '../graphql/queries/trendingPools'
import { useQuery } from '@apollo/client'
import { FAVORITES_BY_USER } from '../graphql/queries/favoritesByUser'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { GET_MULTIPLE_TOKENS } from '../graphql/queries/getMultipleTokens'
import { Token } from '../../types/Token'
import { FavoriteToken } from '../../types/FavoriteToken'

type SortKey = keyof Token
const API_LIMIT = 10

export default function TokenTable({ publicKey, isFavorites }: { publicKey: string, isFavorites?: boolean }) {
  const [page, setPage] = useState(1)
  const [allTokens, setAllTokens] = useState<Token[]>([])
  const [search, setSearch] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const loadingRef = useRef<HTMLDivElement>(null)
  const tableContainer = useRef<HTMLDivElement>(null)
  const { data, loading, fetchMore } = useQuery(TRENDING_POOLS, {
    variables: { page: 1 },
    skip: isFavorites
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

  useEffect(() => {
    // Infinite scroll
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0]
        if (first.isIntersecting &&
          !loading &&
          !isLoadingMore &&
          data?.trendingPools.hasNextPage) {
          const nextPage = page + 1
          if (nextPage <= API_LIMIT) {
            setIsLoadingMore(true)
            setPage(nextPage)
            fetchMore({
              variables: { page: nextPage },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev
                return {
                  trendingPools: {
                    ...fetchMoreResult.trendingPools,
                    pools: [
                      ...prev.trendingPools.pools,
                      ...fetchMoreResult.trendingPools.pools
                    ]
                  }
                }
              }
            }).then(() => {
              setIsLoadingMore(false)
            })
          }
        }
      },
      {
        root: tableContainer.current,
        rootMargin: '50px',
        threshold: 1.0
      }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [loading, data, fetchMore, page, isLoadingMore])

  const favoritedTokens = favoritesByUserData?.favoritesByUser?.map(
    (favorite: FavoriteToken) => favorite.tokenAddress
  ) || []

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const filteredTokens = useMemo(() => {
    return allTokens
      .filter((token: Token) =>
        token.symbol.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        const modifier = sortOrder === 'asc' ? 1 : -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * modifier
        }
        return ((aValue as number) - (bValue as number)) * modifier
      })
  }, [allTokens, search, sortKey, sortOrder])


  return (
    <div className="flex flex-col">
      <div className="sticky top-0 bg-gray-900 z-10 p-4 -mx-4">
        <input
          type="text"
          placeholder="Search by symbol or address"
          className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div ref={tableContainer} className="overflow-x-auto h-[calc(100vh-219px)]">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800 sticky top-0 z-[1]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400" onClick={() => handleSort('symbol')}>
                  Symbol
                  {sortKey === 'symbol' && (sortOrder === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />)}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortKey === 'price' && (sortOrder === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />)}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                  onClick={() => handleSort('priceChange')}
                >
                  24h Change
                  {sortKey === 'priceChange' && (sortOrder === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />)}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                  onClick={() => handleSort('marketCap')}
                >
                  Market Cap
                  {sortKey === 'marketCap' && (sortOrder === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />)}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                  onClick={() => handleSort('volume')}
                >
                  Volume (24h)
                  {sortKey === 'volume' && (sortOrder === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />)}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Address
                </th>
                {publicKey && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Favorite
                </th>}
              </tr>
            </thead>
            <motion.tbody
              className="bg-gray-900 divide-y divide-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredTokens.map((t) => {
                const token = { ...t, isFavorited: favoritedTokens.includes(t.address) }
                return <TokenRow key={token.address} token={token} publicKey={publicKey} />
              })}
            </motion.tbody>
          </table>
          <div className="h-1"></div>
          <div ref={loadingRef} className="py-4">
            {loading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>

          {/* No results message */}
          {!loading && filteredTokens.length === 0 && (
            <motion.div
              className="text-center text-gray-400 py-4 text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              No tokens found 😔
            </motion.div>
          )}

          {/* End of results message */}
          {!loading && !data?.trendingPools.hasNextPage && filteredTokens.length > 0 && !isFavorites && (
            <motion.div
              className="text-center text-gray-400 py-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              You've reached the end 🎉
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

