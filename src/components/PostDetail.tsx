import type { ReactElement } from 'react';
import type { HnPost } from '../api/hackerNews';

function htmlToText(html: string): string {
    if (!html) {
        return '';
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent ?? '';
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('pl-PL');
}

interface PostDetailProps {
    readonly post: HnPost;
}

export function PostDetail({ post }: PostDetailProps): ReactElement {
    const text = htmlToText(post.text);

    return (
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', margin: 0, padding: '8px 16px' }}>
            <dt>Created</dt>
            <dd>{formatDate(post.createdAt)}</dd>

            <dt>Link</dt>
            <dd>
                {post.url ? (
                    <a href={post.url} target="_blank" rel="noreferrer">
                        {post.url}
                    </a>
                ) : (
                    '—'
                )}
            </dd>

            <dt>Discussion</dt>
            <dd>
                <a href={`https://news.ycombinator.com/item?id=${post.id}`} target="_blank" rel="noreferrer">
                    news.ycombinator.com/item?id={post.id}
                </a>
            </dd>

            {text ? (
                <>
                    <dt>Text</dt>
                    <dd>{text}</dd>
                </>
            ) : null}
        </dl>
    );
}