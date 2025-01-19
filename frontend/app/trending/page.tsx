'use client'

import Layout from '../components/Layout'
import TokenTable from '../components/TokenTable'
import { useQuery, useMutation } from '@apollo/client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { TRENDING_POOLS } from '../graphql/queries/trendingPools'
import { CREATE_USER } from '../graphql/mutations/createUser'
import { FAVORITES_BY_USER } from '../graphql/queries/favoritesByUser'
import { FavoriteToken } from '../../types/FavoriteToken'

export default function TrendingPage() {
  const { publicKey, connected } = useWallet()
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, error, data } = useQuery(TRENDING_POOLS, { variables: { page: currentPage } })
  const [createUser] = useMutation(CREATE_USER)

  const { data: favoritesByUser } = useQuery(FAVORITES_BY_USER, { variables: { publicKey: publicKey?.toString() }, skip: !publicKey })

  useEffect(() => {
    if (connected && publicKey) {
      const storedPublicKey = localStorage.getItem('publicKey')
      if (!storedPublicKey) {
        createUser({ variables: { publicKey: publicKey.toString() } })
          .then(() => localStorage.setItem('publicKey', publicKey.toString()))
          .catch(error => console.error('User already exists:', error))
      }
    }
  }, [connected, publicKey, createUser])

  const favoritedTokens = (favoritesByUser?.favoritesByUser || []).map((fav: FavoriteToken) => fav.tokenAddress)

  if (loading) {
    return (
      <Layout favorites={favoritedTokens}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout favorites={favoritedTokens}>
        <div className="text-red-500">Error loading trending tokens: {error.message}</div>
      </Layout>
    )
  }

  return (
    <Layout favorites={favoritedTokens}>
      <TokenTable publicKey={publicKey?.toString() || ''} />
    </Layout>
  )
}