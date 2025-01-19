'use client'

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
})

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    trendingPools: {
                        keyArgs: false,
                        merge(existing = { pools: [] }, incoming) {
                            // grab unique pool addresses only
                            const existingAddresses = new Set(
                                existing.pools.map((pool: any) => pool.address)
                            );
                            const uniqueIncoming = incoming.pools.filter(
                                (pool: any) => !existingAddresses.has(pool.address)
                            );
                            return {
                                ...incoming,
                                pools: [...existing.pools, ...uniqueIncoming]
                            }
                        }
                    }
                }
            }
        }
    })
})
