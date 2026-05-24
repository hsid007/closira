/**
 * useAsync — generic hook for fetching async data with loading + error state.
 *
 * Bare-bones intentionally; for a real app I'd reach for React Query, but
 * for a mocked prototype a hand-rolled hook keeps deps minimal.
 */
import { useCallback, useEffect, useState } from "react";

interface UseAsyncResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): UseAsyncResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const run = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await fn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, refresh: run };
}
