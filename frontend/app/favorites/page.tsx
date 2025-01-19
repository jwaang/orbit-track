'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import Layout from '../components/Layout'
import TokenTable from '../components/TokenTable'
import { CREATE_USER } from '../graphql/mutations/createUser'
import { useMutation } from '@apollo/client'
import { useEffect } from 'react'

export default function FavoritesPage() {
  const { publicKey, connected } = useWallet()

  const [createUser] = useMutation(CREATE_USER)

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

  return (
    <Layout>
      <TokenTable publicKey={publicKey?.toString() || ''} isFavorites />
    </Layout >
  )
}
