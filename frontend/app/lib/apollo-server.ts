import { ApolloClient, InMemoryCache } from '@apollo/client';

export function getClient() {
    if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
        throw new Error('Missing NEXT_PUBLIC_GRAPHQL_URL environment variable.');
    }

    return new ApolloClient({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache',
            },
        },
    });
}
