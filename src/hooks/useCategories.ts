import { useEffect, useState } from "react";
import { getCategories } from "../api/categories";
import type { CategoryResponse } from "../types/api";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getCategories(controller.signal)
      .then((res) => setCategories(res))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "failed to load categories");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { categories, isLoading, error };
}
