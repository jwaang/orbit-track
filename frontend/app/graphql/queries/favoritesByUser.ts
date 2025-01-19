import { gql } from '@apollo/client'

export const FAVORITES_BY_USER = gql`
  query GetFavoritesByUser($publicKey: String!) {
    favoritesByUser(publicKey: $publicKey) {
      id
      publicKey
      tokenAddress
      createdAt
    }
  }
`