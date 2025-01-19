export type Token = {
    __typename: string;
    symbol: string
    icon: string
    price: number
    priceChange: number
    marketCap: number
    volume: number
    address: string
    isFavorited: boolean
}
