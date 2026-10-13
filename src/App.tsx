import { useEffect, useState, type ReactElement } from "react";
import {
  Grid,
  GridColumn,
  type GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { fetchPosts, type HnPost } from "./api/hackerNews";

const PAGE_SIZE = 20;

interface RequestState {
  skip: number;
}

interface LoadState {
  request: RequestState;
  posts: HnPost[];
  total: number;
  error: string | null;
}

export function App(): ReactElement {
  const [request, setRequest] = useState<RequestState>({ skip: 0 });
  const [state, setState] = useState<LoadState | null>(null);

  const loading = state === null || state.request !== request;
  const posts = state?.posts ?? [];
  const total = state?.total ?? 0;
  const error =
    state !== null && state.request === request ? state.error : null;

  useEffect(() => {
    const controller = new AbortController();

    fetchPosts({
      skip: request.skip,
      take: PAGE_SIZE,
      filters: {},
      signal: controller.signal,
    })
      .then((result) => {
        setState({
          request,
          posts: [...result.items],
          total: result.total,
          error: null,
        });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          request,
          posts: [],
          total: 0,
          error: reason instanceof Error ? reason.message : "Unknown error",
        });
      });

    return () => controller.abort();
  }, [request]);

  const handlePageChange = (event: GridPageChangeEvent): void => {
    setRequest({ skip: event.page.skip });
  };

  const handleReload = (): void => {
    setRequest((current) => ({ skip: current.skip }));
  };

  return (
    <main style={{ padding: 24 }}>
      <Button onClick={handleReload} disabled={loading}>
        Reload
      </Button>

      {error ? <p role="alert">{error}</p> : null}

      <div style={{ position: "relative", marginTop: 12 }}>
        <Grid
          data={posts}
          dataItemKey="id"
          scrollable="none"
          skip={request.skip}
          take={PAGE_SIZE}
          total={total}
          pageable={{ buttonCount: 10, info: true, previousNext: true }}
          onPageChange={handlePageChange}
        >
          <GridColumn field="type" title="Type" width={100} />
          <GridColumn field="title" title="Title" />
          <GridColumn field="author" title="Author" width={160} />
          <GridColumn field="points" title="Points" width={100} />
          <GridColumn field="comments" title="Comments" width={110} />
        </Grid>

        {loading ? (
          <div className="k-loading-mask">
            <span className="k-loading-text">Loading</span>
            <div className="k-loading-image" />
            <div className="k-loading-color" />
          </div>
        ) : null}
      </div>
    </main>
  );
}
