import { gql } from '@apollo/client'

export const TRENDING_POOLS = gql`
  query TrendingPools($page: Int!) {
    trendingPools(page: $page) {
      pools {
        symbol
        icon
        price
        priceChange
        marketCap
        volume
        address
        isFavorited
      }
      hasNextPage
      currentPage
    }
  }
`