import { createContext, useContext, type ReactNode } from 'react';
import type { FilterValues } from './filters';
import type { RowTone } from './types';

export interface GridContextValue {
    readonly filterValues: FilterValues;
    readonly onFilterChange: (key: string, value: string, immediate: boolean) => void;
    readonly rowToneOf: (item: unknown) => RowTone | undefined;
    readonly renderDetail: (item: unknown) => ReactNode;
}

export const GridContext = createContext<GridContextValue | null>(null);

export function useGridContext(): GridContextValue {
    const value = useContext(GridContext);
    if (value === null) {
        throw new Error('GridContext is missing: render inside <GridWrapper>');
    }
    return value;
}