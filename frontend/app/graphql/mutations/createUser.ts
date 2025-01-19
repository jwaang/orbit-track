import { gql } from '@apollo/client'

export const CREATE_USER = gql`
  mutation CreateUserWithPublicKey($publicKey: String!) {
    createUserWithPublicKey(publicKey: $publicKey) {
      id
      publicKey
      createdAt
    }
  }
` 