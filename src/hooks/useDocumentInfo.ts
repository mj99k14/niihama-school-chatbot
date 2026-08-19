import { useEffect, useState } from "react";
import { getDocumentInfo } from "../api/document";
import type { DocumentInfo } from "../types/api";

export function useDocumentInfo() {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getDocumentInfo(controller.signal)
      .then((res) => setDocumentInfo(res))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "failed to load document info");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { documentInfo, isLoading, error };
}
