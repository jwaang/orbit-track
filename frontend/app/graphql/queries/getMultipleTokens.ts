import { gql } from '@apollo/client'

export const GET_MULTIPLE_TOKENS = gql`
  query GetMultipleTokens($tokenAddresses: [String!]!) {
    getMultipleTokens(tokenAddresses: $tokenAddresses) {
      symbol
      icon
      price
      priceChange
      marketCap
      volume
      address
    }
  }
`