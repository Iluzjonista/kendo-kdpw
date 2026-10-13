import { createContext, useContext, type ReactElement } from 'react';
import type { GridCustomFilterCellProps } from '@progress/kendo-react-grid';
import { DropDownList, type DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import {
    Input,
    NumericTextBox,
    type InputChangeEvent,
    type NumericTextBoxChangeEvent,
} from '@progress/kendo-react-inputs';
import type { FilterValues } from './filters';

interface FilterContextValue {
    values: FilterValues;
    onChange: (key: string, value: string, immediate: boolean) => void;
}

export const FilterContext = createContext<FilterContextValue>({
    values: {},
    onChange: () => undefined,
});

interface Option {
    text: string;
    value: string;
}

const ALL_OPTION: Option = { text: '(All)', value: '' };
const TYPE_OPTIONS: Option[] = [
    { text: 'Show HN', value: 'show_hn' },
    { text: 'Ask HN', value: 'ask_hn' },
    { text: 'Story', value: 'story' },
];

export function TextFilterCell(props: GridCustomFilterCellProps): ReactElement {
    const { values, onChange } = useContext(FilterContext);
    const key = props.field ?? '';

    return (
        <td {...props.tdProps}>
            <Input
                value={values[key] ?? ''}
                onChange={(event: InputChangeEvent) => onChange(key, String(event.value ?? ''), false)}
            />
        </td>
    );
}

export function NumberFilterCell(props: GridCustomFilterCellProps): ReactElement {
    const { values, onChange } = useContext(FilterContext);
    const key = props.field ?? '';
    const current = values[key];

    return (
        <td {...props.tdProps}>
            <NumericTextBox
                value={current ? Number(current) : null}
                min={0}
                format="n0"
                spinners={false}
                onChange={(event: NumericTextBoxChangeEvent) =>
                    onChange(key, event.value === null ? '' : String(event.value), false)
                }
            />
        </td>
    );
}

export function TypeFilterCell(props: GridCustomFilterCellProps): ReactElement {
    const { values, onChange } = useContext(FilterContext);
    const key = props.field ?? '';
    const selected = TYPE_OPTIONS.find((option) => option.value === values[key]) ?? ALL_OPTION;

    return (
        <td {...props.tdProps}>
            <DropDownList
                data={TYPE_OPTIONS}
                textField="text"
                dataItemKey="value"
                defaultItem={ALL_OPTION}
                value={selected}
                onChange={(event: DropDownListChangeEvent) => {
                    const option = event.value as Option | null;
                    onChange(key, option?.value ?? '', true);
                }}
            />
        </td>
    );
}