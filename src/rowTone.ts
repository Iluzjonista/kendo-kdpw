import type { HnPost } from './api/hackerNews';

export type RowTone = 'positive' | 'negative';

const HOT_COMMENTS = 2000;
const QUIET_COMMENTS = 500;

export function getRowTone(post: HnPost): RowTone | undefined {
    if (post.comments < QUIET_COMMENTS) {
        return 'negative';
    }
    if (post.comments >= HOT_COMMENTS) {
        return 'positive';
    }
    return undefined;
}