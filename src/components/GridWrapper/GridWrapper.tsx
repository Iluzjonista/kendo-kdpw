import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
    Grid,
    GridColumn,
    type GridDetailExpandChangeEvent,
    type GridPageChangeEvent,
    type GridSelectionChangeEvent,
} from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { getDataCell, getFilterCell } from './cellFactories';
import { GridContext, type GridContextValue } from './GridContext';
import { GridDetail, GridRow } from './GridParts';
import { SelectedRow } from './SelectedRow';
import { normalizeFilters, sameFilters, type FilterValues } from './filters';
import type { GridWrapperProps } from './types';

const DEFAULT_PAGE_SIZE = 10;
const TEXT_DEBOUNCE_MS = 400;

interface Request {
    readonly skip: number;
    readonly filters: FilterValues;
}

interface LoadState<T> {
    readonly request: Request;
    readonly items: readonly T[];
    readonly total: number;
    readonly error: string | null;
}

export function GridWrapper<T extends object>({
    title,
    columns,
    idField,
    fetchData,
    pageSize = DEFAULT_PAGE_SIZE,
    renderDetail,
    getRowTone,
}: GridWrapperProps<T>): ReactElement {
    const [request, setRequest] = useState<Request>({ skip: 0, filters: {} });
    const [draft, setDraft] = useState<FilterValues>({});
    const [state, setState] = useState<LoadState<T> | null>(null);

    const [detailExpand, setDetailExpand] = useState<GridDetailExpandChangeEvent['detailExpand']>({});
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [shownItem, setShownItem] = useState<T | null>(null);

    const idOf = useCallback((item: T): string => String(item[idField]), [idField]);

    const loading = state === null || state.request !== request;
    const items = useMemo(() => (state ? [...state.items] : []), [state]);
    const total = state?.total ?? 0;
    const error = state?.error ?? null;

    useEffect(() => {
        const controller = new AbortController();

        fetchData({
            skip: request.skip,
            take: pageSize,
            filters: request.filters,
            signal: controller.signal,
        })
            .then((result) => {
                setState({ request, items: result.items, total: result.total, error: null });
                setSelectedItem((current) =>
                    current
                        ? (result.items.find((item) => idOf(item) === idOf(current)) ?? current)
                        : current,
                );
            })
            .catch((reason: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                setState({
                    request,
                    items: [],
                    total: 0,
                    error: reason instanceof Error ? reason.message : 'Failed to load data',
                });
            });

        return () => controller.abort();
    }, [request, fetchData, pageSize, idOf]);

    const applyFilters = useCallback((next: FilterValues): void => {
        setRequest((current) =>
            sameFilters(current.filters, next) ? current : { skip: 0, filters: next },
        );
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => applyFilters(normalizeFilters(draft)), TEXT_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [draft, applyFilters]);

    const handleFilterChange = useCallback(
        (key: string, value: string, immediate: boolean): void => {
            const next = { ...draft, [key]: value };
            setDraft(next);
            if (immediate) {
                applyFilters(normalizeFilters(next));
            }
        },
        [draft, applyFilters],
    );

    const contextValue = useMemo<GridContextValue>(
        () => ({
            filterValues: draft,
            onFilterChange: handleFilterChange,
            rowToneOf: (item) => getRowTone?.(item as T),
            renderDetail: (item) => renderDetail?.(item as T) ?? null,
        }),
        [draft, handleFilterChange, getRowTone, renderDetail],
    );

    const handleRefresh = (): void => {
        const pending = normalizeFilters(draft);
        setRequest((current) => ({
            skip: sameFilters(current.filters, pending) ? current.skip : 0,
            filters: pending,
        }));
    };

    const handlePageChange = (event: GridPageChangeEvent): void => {
        setRequest((current) => ({ ...current, skip: event.page.skip }));
    };

    const handleDetailExpandChange = (event: GridDetailExpandChangeEvent): void => {
        setDetailExpand(event.detailExpand);
    };

    const handleSelectionChange = (event: GridSelectionChangeEvent): void => {
        const nowIds = Object.entries(event.select)
            .filter(([, on]) => Boolean(on))
            .map(([id]) => id);
        const currentId = selectedItem ? idOf(selectedItem) : null;
        const clickedId = nowIds.find((id) => id !== currentId) ?? nowIds[0];

        if (clickedId === undefined || clickedId === currentId) {
            setSelectedItem(null);
            return;
        }
        setSelectedItem(items.find((item) => idOf(item) === clickedId) ?? null);
    };

    const select = useMemo<Record<string, boolean>>(
        () => (selectedItem ? { [idOf(selectedItem)]: true } : {}),
        [selectedItem, idOf],
    );

    return (
        <section>
            {title ? <h1>{title}</h1> : null}

            {shownItem ? <SelectedRow item={shownItem} onHide={() => setShownItem(null)} /> : null}

            <div className="gw-toolbar">
                <Button themeColor="primary" onClick={handleRefresh} disabled={loading}>
                    Refresh
                </Button>
                <Button onClick={() => setShownItem(selectedItem)} disabled={selectedItem === null}>
                    Show selected row
                </Button>
            </div>

            {error ? (
                <div className="gw-error" role="alert">
                    {error}
                </div>
            ) : null}

            <GridContext.Provider value={contextValue}>
                <div className="hn-box" aria-busy={loading}>
                    <Grid
                        className="hn-grid"
                        data={items}
                        dataItemKey={idField}
                        scrollable="none"
                        filterable
                        skip={request.skip}
                        take={pageSize}
                        total={total}
                        pageable={{ buttonCount: 10, info: false, previousNext: true }}
                        onPageChange={handlePageChange}
                        detail={renderDetail ? GridDetail : undefined}
                        detailExpand={detailExpand}
                        onDetailExpandChange={handleDetailExpandChange}
                        selectable={{ enabled: true, mode: 'single' }}
                        select={select}
                        onSelectionChange={handleSelectionChange}
                        rows={{ data: GridRow }}
                    >
                        <GridColumn columnType="checkbox" width={50} />
                        {columns.map((column) => (
                            <GridColumn
                                key={column.field}
                                field={column.field}
                                title={column.title}
                                width={column.width}
                                filterable={column.filter !== undefined}
                                cells={{
                                    data: getDataCell(column),
                                    filterCell: getFilterCell(column),
                                }}
                            />
                        ))}
                    </Grid>

                    {loading ? (
                        <div className="k-loading-mask">
                            <span className="k-loading-text">Loading</span>
                            <div className="k-loading-image" />
                            <div className="k-loading-color" />
                        </div>
                    ) : null}
                </div>
            </GridContext.Provider>
        </section>
    );
}