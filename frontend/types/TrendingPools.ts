import { Token } from "./Token";

export interface TrendingPools {
    pools: Token[];
    hasNextPage: boolean;
    currentPage: number;
}
