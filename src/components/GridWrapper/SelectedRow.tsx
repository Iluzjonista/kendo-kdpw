import type { ReactElement } from 'react';
import { Button } from '@progress/kendo-react-buttons';

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

interface SelectedRowProps {
    readonly item: object;
    readonly onHide: () => void;
}

export function SelectedRow({ item, onHide }: SelectedRowProps): ReactElement {
    return (
        <aside className="gw-selected" aria-live="polite">
            <header className="gw-selected__header">
                <h3>Selected row</h3>
                <Button size="small" onClick={onHide}>
                    Hide
                </Button>
            </header>
            <dl className="gw-selected__list">
                {Object.entries(item).map(([key, value]) => (
                    <div className="gw-selected__item" key={key} style={{ display: 'contents' }}>
                        <dt>{key}</dt>
                        <dd>{formatValue(value)}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}