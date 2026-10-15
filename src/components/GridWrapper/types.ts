import type { ReactNode } from 'react';
import type { DataQuery, PagedResult } from '../../api/types';

export type { DataQuery, PagedResult };

export type RowTone = 'positive' | 'negative';

export interface FilterOption {
    readonly text: string;
    readonly value: string;
}

export type ColumnFilter =
    | { readonly type: 'text'; readonly placeholder?: string }
    | { readonly type: 'number'; readonly placeholder?: string }
    | { readonly type: 'dropdown'; readonly options: readonly FilterOption[] };

export interface GridColumnConfig<T> {
    readonly field: keyof T & string;
    readonly title: string;
    readonly width?: number;
    readonly filter?: ColumnFilter;
    readonly filterKey?: string;
    readonly render?: (item: T) => ReactNode;
}

export interface GridWrapperProps<T extends object> {
    readonly title?: string;
    readonly columns: readonly GridColumnConfig<T>[];
    readonly idField: keyof T & string;
    readonly fetchData: (query: DataQuery) => Promise<PagedResult<T>>;
    readonly pageSize?: number;
    readonly renderDetail?: (item: T) => ReactNode;
    readonly getRowTone?: (item: T) => RowTone | undefined;
}