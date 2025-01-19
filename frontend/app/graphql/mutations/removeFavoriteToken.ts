import { gql } from 'graphql-tag';

export const REMOVE_FAVORITE_TOKEN = gql`
  mutation RemoveFavoriteToken($publicKey: String!, $tokenAddress: String!) {
    removeFavoriteToken(publicKey: $publicKey, tokenAddress: $tokenAddress)
  }
`;