// useAutoPersist.ts
"use client";
import { useEffect, useRef } from "react";

export function useAutoPersist(
  values: unknown,
  save: (patch: unknown) => void,
  debounceMs = 120
) {
  const t = useRef<number | null>(null);
  useEffect(() => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => save(values), debounceMs);
    return () => {
      if (t.current) window.clearTimeout(t.current);
    };
  }, [values, save, debounceMs]);
}
