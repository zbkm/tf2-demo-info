import { useState, useCallback } from 'react';
import init, { parse } from '../wasm/tf2_wasm_demo';
import type { DemoData } from '../types/demo';

export function useDemoParser() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDemo = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      await init();
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const resultJson = parse(bytes);
      const parsedData: DemoData = JSON.parse(resultJson);
      setData(parsedData);
    } catch (err) {
      console.error('Failed to parse demo:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred while parsing demo');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, parseDemo, reset };
}
