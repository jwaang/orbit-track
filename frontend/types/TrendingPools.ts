import { Token } from "./Token";

export interface TrendingPools {
    pools: Token[];
    hasNextPage: boolean;
    currentPage: number;
}

export interface TrendingPoolsResponse {
    trendingPools: TrendingPools;
}
