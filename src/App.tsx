import { useEffect, useState, type ReactElement } from 'react';
import { fetchPosts, type HnPost } from './api/hackerNews';

export function App(): ReactElement {
  const [posts, setPosts] = useState<readonly HnPost[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchPosts({
      skip: 0,
      take: 5,
      filters: { title: 'react', points: '100' },
      signal: controller.signal,
    })
      .then((result) => {
        setPosts(result.items);
        setTotal(result.total);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Unknown error');
      });

    return () => controller.abort();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Test API</h1>
      {error ? <p>{error}</p> : null}
      <p>Total: {total ?? '...'}</p>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </main>
  );
}