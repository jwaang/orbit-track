import { test, mock } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../app.js';

const mockFetch = mock.fn();
mock.method(global, 'fetch', mockFetch);

const mockTrendingPoolsResponse = {
  data: [{
    relationships: {
      base_token: { data: { id: 'token1' } }
    },
    attributes: {
      volume_usd: { h24: '1000000' },
      base_token_price_usd: 1.5,
      price_change_percentage: { h24: 5.5 },
      market_cap_usd: 1000000000
    }
  }],
  included: [{
    id: 'token1',
    attributes: {
      symbol: 'TEST',
      image_url: 'https://test.com/image.png',
      address: 'testAddress123'
    }
  }]
};

const mockMultipleTokensResponse = {
  data: [{
    id: 'token1',
    attributes: {
      symbol: 'TEST',
      image_url: 'https://test.com/image.png',
      price_usd: '1.5',
      market_cap_usd: '1000000000',
      volume_usd: { h24: '1000000' },
      address: 'testAddress123'
    }
  }],
  included: [{
    type: 'pool',
    relationships: {
      base_token: { data: { id: 'token1' } }
    },
    attributes: {
      price_change_percentage: { h24: 5.5 }
    }
  }]
};

const mockPgClient = {
  query: mock.fn()
};

async function buildTestServer() {
  const app = await buildServer({
    postgres: mockPgClient
  });
  return app;
}

test('GET /health returns status ok', async (t) => {
  const app = await buildTestServer();
  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.json(), { status: 'ok' });
});

test('trendingPools query returns paginated pools', async (t) => {
  const app = await buildTestServer();

  mockFetch.mock.mockImplementationOnce(async () => ({
    ok: true,
    json: async () => mockTrendingPoolsResponse
  }));

  const query = `
    query {
      trendingPools(page: 1) {
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
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.ok(result.data.trendingPools.pools.length > 0);
});

test('favoritesByUser query returns user favorites', async (t) => {
  const app = await buildTestServer();

  const mockFavorites = [{
    id: 1,
    public_key: 'testKey',
    token_address: 'testAddress',
    created_at: new Date()
  }];

  mockPgClient.query.mock.mockImplementationOnce(async () => ({ rows: mockFavorites }));

  const query = `
    query {
      favoritesByUser(publicKey: "testKey") {
        id
        publicKey
        tokenAddress
        createdAt
      }
    }
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.ok(result.data.favoritesByUser.length > 0);
});

test('getMultipleTokens query returns token details', async (t) => {
  const app = await buildTestServer();

  mockFetch.mock.mockImplementationOnce(async () => ({
    ok: true,
    json: async () => mockMultipleTokensResponse
  }));

  const query = `
    query {
      getMultipleTokens(tokenAddresses: ["testAddress123"]) {
        symbol
        icon
        price
        priceChange
        marketCap
        volume
        address
        isFavorited
      }
    }
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.ok(result.data.getMultipleTokens.length > 0);
});

// GraphQL Mutation Tests
test('createUserWithPublicKey mutation creates new user', async (t) => {
  const app = await buildTestServer();

  const mockUser = {
    id: 1,
    public_key: 'testKey',
    created_at: new Date()
  };

  mockPgClient.query.mock.mockImplementationOnce(async () => ({ rows: [mockUser] }));

  const mutation = `
    mutation {
      createUserWithPublicKey(publicKey: "testKey") {
        id
        publicKey
        createdAt
      }
    }
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query: mutation }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.ok(result.data.createUserWithPublicKey.id);
});

test('addFavoriteToken mutation adds token to favorites', async (t) => {
  const app = await buildTestServer();

  const mockFavorite = {
    id: 1,
    public_key: 'testKey',
    token_address: 'testAddress',
    created_at: new Date()
  };

  mockPgClient.query.mock.mockImplementationOnce(async () => ({ rows: [mockFavorite] }));

  const mutation = `
    mutation {
      addFavoriteToken(publicKey: "testKey", tokenAddress: "testAddress") {
        id
        publicKey
        tokenAddress
        createdAt
      }
    }
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query: mutation }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.ok(result.data.addFavoriteToken.id);
});

test('removeFavoriteToken mutation removes token from favorites', async (t) => {
  const app = await buildTestServer();

  mockPgClient.query.mock.mockImplementationOnce(() => ({ rowCount: 1 }));

  const mutation = `
    mutation {
      removeFavoriteToken(publicKey: "testKey", tokenAddress: "testAddress")
    }
  `;

  const response = await app.inject({
    method: 'POST',
    url: '/graphql',
    payload: { query: mutation }
  });

  const result = response.json();
  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(result.data.removeFavoriteToken, true);
});