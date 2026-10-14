import type { ReactElement } from 'react';
import type { GridCustomRowProps } from '@progress/kendo-react-grid';
import type { HnPost } from './api/hackerNews';
import { getRowTone } from './rowTone';

export function PostRow(props: GridCustomRowProps): ReactElement {
    const { trProps, children, dataItem, isSelected } = props;
    const tone = getRowTone(dataItem as HnPost);

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