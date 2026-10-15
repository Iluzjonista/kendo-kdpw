import type { ReactElement } from 'react';
import type { GridCustomRowProps, GridDetailRowProps } from '@progress/kendo-react-grid';
import { useGridContext } from '../context/GridContext';

export function GridRow(props: GridCustomRowProps): ReactElement {
    const { rowToneOf } = useGridContext();
    const { trProps, children, dataItem, isSelected } = props;
    const tone = rowToneOf(dataItem);

    const className = [
        props.className,
        trProps?.className,
        tone ? `row--${tone}` : '',
        isSelected ? 'row--selected' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <tr
            {...trProps}
            className={className}
            onClick={props.onClick ?? trProps?.onClick}
            onDoubleClick={props.onDoubleClick ?? trProps?.onDoubleClick}
        >
            {children}
        </tr>
    );
}

export function GridDetail(props: GridDetailRowProps): ReactElement {
    const { renderDetail } = useGridContext();
    return <div>{renderDetail(props.dataItem)}</div>;
}