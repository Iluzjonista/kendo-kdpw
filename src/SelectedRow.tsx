import type { ReactElement } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import type { HnPost } from './api/hackerNews';

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    return String(value);
}

interface SelectedRowProps {
    post: HnPost;
    onHide: () => void;
}

export function SelectedRow({ post, onHide }: SelectedRowProps): ReactElement {
    return (
        <section
            style={{ margin: '12px 0', padding: '12px 16px', border: '1px solid #bfd3fb', borderRadius: 6, background: '#f1f6ff' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Selected row</h3>
                <Button fillMode="flat" size="small" onClick={onHide}>
                    Hide
                </Button>
            </header>
            <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 16px', margin: '8px 0 0' }}>
                {Object.entries(post).map(([key, value]) => (
                    <div key={key} style={{ display: 'contents' }}>
                        <dt style={{ fontWeight: 600 }}>{key}</dt>
                        <dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{formatValue(value)}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}