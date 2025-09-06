"use client";

import { useCallback, useEffect, useState } from "react";

export function useGitHubFiles(folder = "drafts", initialFiles = []) {
  const [files, setFiles] = useState(initialFiles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/drafts?folder=${encodeURIComponent(folder)}`
      );
      if (!res.ok) throw new Error("Failed to fetch drafts");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
}
