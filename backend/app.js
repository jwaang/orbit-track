import mercurius from 'mercurius'
import fastifyPostgres from '@fastify/postgres'
import fetch from 'node-fetch'
import cors from '@fastify/cors'

const schema = `
  type User {
    id: ID!
    publicKey: String!
    createdAt: String!
  }

  type TrendingPool {
    symbol: String!
    icon: String
    price: Float
    priceChange: Float
    marketCap: Float
    volume: Float
    address: String!
    isFavorited: Boolean!
  }

  type PaginatedTrendingPools {
    pools: [TrendingPool!]!
    hasNextPage: Boolean!
    currentPage: Int!
  }

  type FavoriteToken {
    id: ID!
    publicKey: String!
    tokenAddress: String!
    createdAt: String!
  }

  type Query {
    trendingPools(page: Int!): PaginatedTrendingPools!
    favoritesByUser(publicKey: String!): [FavoriteToken]
    getMultipleTokens(tokenAddresses: [String!]!): [TrendingPool]
  }

  type Mutation {
    createUserWithPublicKey(publicKey: String!): User
    addFavoriteToken(publicKey: String!, tokenAddress: String!): FavoriteToken
    removeFavoriteToken(publicKey: String!, tokenAddress: String!): Boolean
  }
`

const resolvers = {
  Query: {
    trendingPools: async (_, { page = 1 }) => {
      try {
        const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?include=base_token&page=${page}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const tokenPoolMap = new Map();

        data.data.forEach(pool => {
          const baseTokenId = pool.relationships.base_token.data.id;
          const baseToken = data.included.find(token => token.id === baseTokenId);

          if (baseToken) {
            const volume24h = parseFloat(pool.attributes.volume_usd.h24 || '0');

            if (!tokenPoolMap.has(baseTokenId) || volume24h > tokenPoolMap.get(baseTokenId).volume) {
              tokenPoolMap.set(baseTokenId, {
                symbol: baseToken.attributes.symbol || 'Unknown',
                icon: baseToken.attributes.image_url || null,
                price: pool.attributes.base_token_price_usd,
                priceChange: pool.attributes.price_change_percentage.h24,
                marketCap: pool.attributes.market_cap_usd,
                volume: volume24h,
                address: baseToken.attributes.address || ''
              });
            }
          }
        });

        const pools = Array.from(tokenPoolMap.values());

        return {
          pools: pools || [],
          hasNextPage: page < 10,
          currentPage: page
        };
      } catch (error) {
        console.error('Error fetching trending pools:', error);
        return {
          pools: [],
          hasNextPage: false,
          currentPage: page
        };
      }
    },
    favoritesByUser: async (_, { publicKey }, { pg }) => {
      const result = await pg.query(
        'SELECT * FROM favorite_tokens WHERE public_key = $1 ORDER BY created_at DESC',
        [publicKey]
      );
      return result.rows.map(row => ({
        id: row.id,
        publicKey: row.public_key,
        tokenAddress: row.token_address,
        createdAt: row.created_at.toISOString()
      }));
    },
    getMultipleTokens: async (_, { tokenAddresses }) => {
      const addressesString = tokenAddresses.join(',');
      const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/multi/${addressesString}?include=top_pools`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log(data)

      return data.data.map(token => {
        // Find the associated pool to find priceChange value
        const topPool = data.included?.find(item => {
          return item.type === 'pool' &&
            item.relationships.base_token.data.id === token.id;
        });

        return {
          symbol: token.attributes.symbol,
          icon: token.attributes.image_url,
          price: parseFloat(token.attributes.price_usd),
          priceChange: topPool ? parseFloat(topPool.attributes.price_change_percentage.h24) : 0,
          marketCap: parseFloat(token.attributes.market_cap_usd || '0'),
          volume: parseFloat(token.attributes.volume_usd.h24 || '0'),
          address: token.attributes.address,
          isFavorited: false
        };
      });
    }
  },
  Mutation: {
    createUserWithPublicKey: async (_, { publicKey }, { pg }) => {
      try {
        const result = await pg.query(
          'INSERT INTO users (public_key) VALUES ($1) RETURNING id, public_key, created_at',
          [publicKey]
        );

        return {
          id: result.rows[0].id,
          publicKey: result.rows[0].public_key,
          createdAt: result.rows[0].created_at.toISOString()
        };
      } catch (error) {
        if (error.code === '23505') {
          const existingUser = await pg.query(
            'SELECT id, public_key, created_at FROM users WHERE public_key = $1',
            [publicKey]
          );
          return {
            id: existingUser.rows[0].id,
            publicKey: existingUser.rows[0].public_key,
            createdAt: existingUser.rows[0].created_at.toISOString()
          };
        }
        throw error;
      }
    },
    addFavoriteToken: async (_, { publicKey, tokenAddress }, { pg }) => {
      try {
        const result = await pg.query(
          'INSERT INTO favorite_tokens (public_key, token_address) VALUES ($1, $2) RETURNING id, public_key, token_address, created_at',
          [publicKey, tokenAddress]
        );
        return {
          id: result.rows[0].id,
          publicKey: result.rows[0].public_key,
          tokenAddress: result.rows[0].token_address,
          createdAt: result.rows[0].created_at.toISOString()
        };
      } catch (error) {
        if (error.code === '23505') {
          throw new Error('Token is already favorited');
        }
        throw error;
      }
    },
    removeFavoriteToken: async (_, { publicKey, tokenAddress }, { pg }) => {
      const result = await pg.query(
        'DELETE FROM favorite_tokens WHERE public_key = $1 AND token_address = $2',
        [publicKey, tokenAddress]
      );
      return result.rowCount > 0;
    }
  },
  TrendingPool: {
    isFavorited: async (parent, _, { pg, publicKey }) => {
      if (!publicKey) return false;

      const result = await pg.query(
        'SELECT 1 FROM favorite_tokens WHERE public_key = $1 AND token_address = $2',
        [publicKey, parent.address]
      );
      return result.rowCount > 0;
    }
  }
}

const trendingPoolsCache = new Map();

export default async function (fastify, opts) {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS']
  })

  await fastify.register(fastifyPostgres, {
    connectionString: 'postgresql://postgres@localhost:5432/postgres'
  })

  await fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: true,
    context: (request) => {
      return {
        pg: fastify.pg,
        publicKey: request.headers['x-public-key'] || null
      }
    }
  })
}