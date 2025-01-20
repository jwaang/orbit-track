// Mock data for trending pools
export const mockTrendingPoolsData = {
  data: [
    {
      id: 'pool1',
      type: 'pool',
      attributes: {
        volume_usd: { h24: '1000000' },
        base_token_price_usd: 1.23,
        price_change_percentage: { h24: 5.67 },
        market_cap_usd: 1000000000
      },
      relationships: {
        base_token: {
          data: { id: 'token1' }
        }
      }
    }
  ],
  included: [
    {
      id: 'token1',
      type: 'token',
      attributes: {
        symbol: 'TEST',
        image_url: 'https://example.com/test.png',
        address: 'tokenAddress123'
      }
    }
  ]
};

// Mock data for multi-token endpoint
export const mockMultiTokenData = {
  data: [
    {
      id: 'token1',
      type: 'token',
      attributes: {
        symbol: 'TEST',
        image_url: 'https://example.com/test.png',
        price_usd: '1.23',
        market_cap_usd: '1000000000',
        volume_usd: { h24: '1000000' },
        address: 'tokenAddress123'
      }
    }
  ],
  included: [
    {
      type: 'pool',
      attributes: {
        price_change_percentage: { h24: 5.67 }
      },
      relationships: {
        base_token: {
          data: { id: 'token1' }
        }
      }
    }
  ]
};

export const mockFetch = async (url) => {
  // Mock trending pools endpoint
  if (url.includes('/trending_pools')) {
    return {
      ok: true,
      json: async () => mockTrendingPoolsData
    };
  }

  // Mock multi-token endpoint
  if (url.includes('/tokens/multi/')) {
    return {
      ok: true,
      json: async () => mockMultiTokenData
    };
  }

  // Mock error response for unknown endpoints
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  };
};

// Helper function to simulate failed requests
export const mockFailedFetch = async () => {
  return {
    ok: false,
    status: 500,
    json: async () => ({ error: 'Internal server error' })
  };
};