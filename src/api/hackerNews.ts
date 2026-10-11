import type { DataQuery, PagedResult } from './types';

const BASE_URL = 'https://hn.algolia.com/api/v1/search';
// max wynikow, ktore mozna pobrac z algolia (https://hn.algolia.com/api)
const MAX_ACCESSIBLE_HITS = 1000;

export type PostType = 'story' | 'show_hn' | 'ask_hn';

export interface HnPost {
    id: string;
    title: string;
    author: string;
    type: PostType;
    points: number;
    comments: number;
    createdAt: string;
    url: string;
    text: string;
}

interface AlgoliaHit {
    objectID: string;
    title: string | null;
    url: string | null;
    author: string;
    points: number | null;
    num_comments: number | null;
    created_at: string;
    story_text: string | null;
    _tags: string[];
}

interface AlgoliaResponse {
    hits: AlgoliaHit[];
    nbHits: number;
}

function toPost(hit: AlgoliaHit): HnPost {
    let type: PostType = 'story';
    if (hit._tags.includes('show_hn')) {
        type = 'show_hn';
    } else if (hit._tags.includes('ask_hn')) {
        type = 'ask_hn';
    }

    return {
        id: hit.objectID,
        title: hit.title ?? '(no title)',
        author: hit.author,
        type,
        points: hit.points ?? 0,
        comments: hit.num_comments ?? 0,
        createdAt: hit.created_at,
        url: hit.url ?? '',
        text: hit.story_text ?? '',
    };
}

function toCount(value: string | undefined): number | null {
    if (!value || !/^\d+$/.test(value)) {
        return null;
    }
    return Number(value);
}

function buildParams(query: DataQuery): URLSearchParams {
    const filters = query.filters;
    const params = new URLSearchParams();

    params.set('page', String(Math.floor(query.skip / query.take)));
    params.set('hitsPerPage', String(query.take));


    if (filters['title']) {
        params.set('query', filters['title']);
    }

    const tags = [filters['type'] || 'story'];
    if (filters['author']) {
        tags.push(`author_${filters['author']}`);
    }
    params.set('tags', tags.join(','));

    const numeric: string[] = [];
    const points = toCount(filters['points']);
    if (points !== null) {
        numeric.push(`points>=${points}`);
    }
    const comments = toCount(filters['comments']);
    if (comments !== null) {
        numeric.push(`num_comments>=${comments}`);
    }
    if (numeric.length > 0) {
        params.set('numericFilters', numeric.join(','));
    }

    return params;
}

export async function fetchPosts(query: DataQuery): Promise<PagedResult<HnPost>> {
    const response = await fetch(`${BASE_URL}?${buildParams(query).toString()}`, {
        signal: query.signal,
    });
    if (!response.ok) {
        throw new Error(`Hacker News request failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as AlgoliaResponse;
    return {
        items: body.hits.map(toPost),
        total: Math.min(body.nbHits, MAX_ACCESSIBLE_HITS),
    };
}