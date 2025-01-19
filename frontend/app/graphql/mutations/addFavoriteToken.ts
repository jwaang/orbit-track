import { gql } from 'graphql-tag';

export const ADD_FAVORITE_TOKEN = gql`
  mutation AddFavoriteToken($publicKey: String!, $tokenAddress: String!) {
    addFavoriteToken(publicKey: $publicKey, tokenAddress: $tokenAddress) {
      id
      publicKey
      tokenAddress
      createdAt
    }
  }
`;