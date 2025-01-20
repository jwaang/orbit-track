import { FAVORITES_BY_USER } from "@/app/graphql/queries/favoritesByUser"
import { GET_MULTIPLE_TOKENS } from "@/app/graphql/queries/getMultipleTokens"
import { FavoriteToken } from "@/types/FavoriteToken"
import { useQuery } from "@apollo/client"
import { useWallet } from "@solana/wallet-adapter-react"

export function useFavorite() {
    const { publicKey } = useWallet()
    const { data: favoritesByUserData } = useQuery(FAVORITES_BY_USER, {
        variables: { publicKey },
        skip: !publicKey
    })

    const { data: favoritedTokensData, loading: favoritedTokensLoading } = useQuery(GET_MULTIPLE_TOKENS, {
        variables: { tokenAddresses: favoritesByUserData?.favoritesByUser?.map((fav: FavoriteToken) => fav.tokenAddress) || [] },
        skip: !favoritesByUserData?.favoritesByUser?.length
    })

    return { favoritesByUserData, favoritedTokensData, favoritedTokensLoading }
}
