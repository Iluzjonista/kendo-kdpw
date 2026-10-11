export interface DataQuery {
    skip: number;
    take: number;
    filters: Readonly<Record<string, string>>;
    signal: AbortSignal;
}
export interface PagedResult<T> {
    items: readonly T[];
    total: number;
}