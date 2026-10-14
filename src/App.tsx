import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Grid,
  GridColumn,
  type GridDetailExpandChangeEvent,
  type GridPageChangeEvent,
  type GridSelectionChangeEvent,
} from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { fetchPosts, type HnPost } from './api/hackerNews';
import { normalizeFilters, sameFilters, type FilterValues } from './filters';
import { FilterContext, NumberFilterCell, TextFilterCell, TypeFilterCell } from './filterCells';
import { SelectedRow } from './SelectedRow';
import { PostRow } from './PostRow';

const PAGE_SIZE = 20;
const FILTER_DEBOUNCE_MS = 400;
type DetailExpand = GridDetailExpandChangeEvent['detailExpand'];
type Selection = GridSelectionChangeEvent['select'];

interface RequestState {
  skip: number;
  filters: FilterValues;
}

interface LoadState {
  request: RequestState;
  posts: HnPost[];
  total: number;
  error: string | null;
}

export function App(): ReactElement {
  const [request, setRequest] = useState<RequestState>({ skip: 0, filters: {} });
  const [draft, setDraft] = useState<FilterValues>({});
  const [state, setState] = useState<LoadState | null>(null);
  const [detailExpand, setDetailExpand] = useState<DetailExpand>({});
  const [select, setSelect] = useState<Selection>({});
  const [selectedPost, setSelectedPost] = useState<HnPost | null>(null);
  const [shownPost, setShownPost] = useState<HnPost | null>(null);

  const loading = state === null || state.request !== request;
  const posts = state?.posts ?? [];
  const total = state?.total ?? 0;
  const error = state !== null && state.request === request ? state.error : null;

  useEffect(() => {
    const controller = new AbortController();

    fetchPosts({
      skip: request.skip,
      take: PAGE_SIZE,
      filters: request.filters,
      signal: controller.signal,
    })
      .then((result) => {
        setState({ request, posts: [...result.items], total: result.total, error: null });
        setSelectedPost((current) =>
          current ? (result.items.find((item) => item.id === current.id) ?? current) : current,
        );
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          request,
          posts: [],
          total: 0,
          error: reason instanceof Error ? reason.message : 'Unknown error',
        });
      });

    return () => controller.abort();
  }, [request]);

  const applyFilters = useCallback((next: FilterValues): void => {
    setRequest((current) =>
      sameFilters(current.filters, next) ? current : { skip: 0, filters: next },
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => applyFilters(normalizeFilters(draft)),
      FILTER_DEBOUNCE_MS,
    );
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

  const filterContext = useMemo(
    () => ({ values: draft, onChange: handleFilterChange }),
    [draft, handleFilterChange],
  );

  const handlePageChange = (event: GridPageChangeEvent): void => {
    setRequest((current) => ({ ...current, skip: event.page.skip }));
  };


  const handleDetailExpandChange = (event: GridDetailExpandChangeEvent): void => {
    setDetailExpand(event.detailExpand);
  };

  const handleSelectionChange = (event: GridSelectionChangeEvent): void => {
    const selectedNow = posts.filter((post) => Boolean(event.select[post.id]));

    const clicked =
      selectedNow.find((post) => post.id !== selectedPost?.id) ?? selectedNow[0] ?? null;
    if (clicked === null || clicked.id === selectedPost?.id) {
      setSelect({});
      setSelectedPost(null);
      return;
    }
    setSelect({ [clicked.id]: true });
    setSelectedPost(clicked);
  };

  const handleRefresh = (): void => {
    const pending = normalizeFilters(draft);
    setRequest((current) =>
      sameFilters(current.filters, pending) ? { ...current } : { skip: 0, filters: pending },
    );
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Hacker News</h1>

      {shownPost ? <SelectedRow post={shownPost} onHide={() => setShownPost(null)} /> : null}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button themeColor="primary" onClick={handleRefresh} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={() => setShownPost(selectedPost)} disabled={selectedPost === null}>
          Show selected row
        </Button>
      </div>

      {error ? <p role="alert">{error}</p> : null}

      <FilterContext.Provider value={filterContext}>
        <div style={{ position: 'relative', marginTop: 12 }}>
          <Grid
            className="hn-grid"
            data={posts}
            dataItemKey="id"
            scrollable="none"
            filterable
            skip={request.skip}
            take={PAGE_SIZE}
            total={total}
            pageable={{ buttonCount: 10, info: true, previousNext: true }}
            onPageChange={handlePageChange}
            // detail={PostDetail}
            rows={{ data: PostRow }}
            detailExpand={detailExpand}
            onDetailExpandChange={handleDetailExpandChange}
            selectable={{ enabled: true, mode: 'single' }}
            select={select}
            onSelectionChange={handleSelectionChange}
          >
            <GridColumn columnType="checkbox" width={50} />
            <GridColumn field="type" title="Type" width={130} cells={{ filterCell: TypeFilterCell }} />
            <GridColumn field="title" title="Title" cells={{ filterCell: TextFilterCell }} />
            <GridColumn field="author" title="Author" width={180} cells={{ filterCell: TextFilterCell }} />
            <GridColumn field="points" title="Points" width={110} cells={{ filterCell: NumberFilterCell }} />
            <GridColumn field="comments" title="Comments" width={120} cells={{ filterCell: NumberFilterCell }} />
          </Grid>

          {loading ? (
            <div className="k-loading-mask">
              <span className="k-loading-text">Loading</span>
              <div className="k-loading-image" />
              <div className="k-loading-color" />
            </div>
          ) : null}
        </div>
      </FilterContext.Provider>
    </main>
  );
}