import Layout from '../components/Layout'
import TokenTable from '../components/TokenTable'
import { TRENDING_POOLS } from '../graphql/queries/trendingPools'
import { getClient } from '../lib/apollo-server';

export default async function TrendingPage() {
  const client = getClient();

  const result = await client.query({
    query: TRENDING_POOLS,
    variables: { page: 1 },
  });

  return (
    <Layout>
      <TokenTable initialTrendingPools={result?.data} />
    </Layout>
  )
}
