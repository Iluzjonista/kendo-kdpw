import type { ReactElement, ReactNode } from 'react';
import type { GridCustomCellProps, GridCustomFilterCellProps } from '@progress/kendo-react-grid';
import { Input, NumericTextBox } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { useGridContext } from './GridContext';
import type { ColumnFilter, FilterOption, GridColumnConfig } from './types';
import { HeaderThElement } from '@progress/kendo-react-data-tools';

type FilterCellComponent = (props: GridCustomFilterCellProps) => ReactElement;
type DataCellComponent = (props: GridCustomCellProps) => ReactElement;

const ALL_OPTION: FilterOption = { text: '(All)', value: '' };

function FilterCellShell(props: { cell: GridCustomFilterCellProps; children: ReactNode }): ReactElement {
    const { thProps } = props.cell;
    return (
    <HeaderThElement {...thProps} columnId={thProps?.columnId ?? ''}>
        {props.children}
    </HeaderThElement>
    );
}

function createFilterCell(filterKey: string, filter: ColumnFilter): FilterCellComponent {
    switch (filter.type) {
        case 'text':
            return function TextFilterCell(cell) {
                const { filterValues, onFilterChange } = useGridContext();
                return (
                    <FilterCellShell cell={cell}>
                        <Input
                            value={filterValues[filterKey] ?? ''}
                            placeholder={filter.placeholder}
                            onChange={(event) => onFilterChange(filterKey, String(event.value), false)}
                        />
                    </FilterCellShell>
                );
            };

        case 'number':
            return function NumberFilterCell(cell) {
                const { filterValues, onFilterChange } = useGridContext();
                const raw = filterValues[filterKey] ?? '';
                return (
                    <FilterCellShell cell={cell}>
                        <NumericTextBox
                            value={raw === '' ? null : Number(raw)}
                            min={0}
                            format="n0"
                            spinners={false}
                            placeholder={filter.placeholder}
                            onChange={(event) =>
                                onFilterChange(filterKey, event.value === null ? '' : String(event.value), false)
                            }
                        />
                    </FilterCellShell>
                );
            };

        case 'dropdown': {
            const data: FilterOption[] = [ALL_OPTION, ...filter.options];
            return function DropdownFilterCell(cell) {
                const { filterValues, onFilterChange } = useGridContext();
                const current = filterValues[filterKey] ?? '';
                const selected = data.find((option) => option.value === current) ?? ALL_OPTION;
                return (
                    <FilterCellShell cell={cell}>
                        <DropDownList
                            data={data}
                            textField="text"
                            dataItemKey="value"
                            value={selected}
                            onChange={(event) => {
                                const option = event.value as FilterOption;
                                onFilterChange(filterKey, option.value, true);
                            }}
                        />
                    </FilterCellShell>
                );
            };
        }
    }
}

function createDataCell<T>(render: (item: T) => ReactNode): DataCellComponent {
    return function RenderedCell(cell) {
        return <td {...cell.tdProps}>{render(cell.dataItem as T)}</td>;
    };
}

const filterCells = new WeakMap<object, FilterCellComponent>();
const dataCells = new WeakMap<object, DataCellComponent>();

export function getFilterCell<T>(column: GridColumnConfig<T>): FilterCellComponent | undefined {
    if (!column.filter) {
        return undefined;
    }
    const cached = filterCells.get(column);
    if (cached) {
        return cached;
    }
    const cell = createFilterCell(column.filterKey ?? column.field, column.filter);
    filterCells.set(column, cell);
    return cell;
}

export function getDataCell<T>(column: GridColumnConfig<T>): DataCellComponent | undefined {
    if (!column.render) {
        return undefined;
    }
    const cached = dataCells.get(column);
    if (cached) {
        return cached;
    }
    const cell = createDataCell<T>(column.render);
    dataCells.set(column, cell);
    return cell;
}