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
      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Unauthorized: Invalid or missing GitHub token");
        if (res.status === 403)
          throw new Error("Forbidden: Check token scopes or rate limit");
        if (res.status === 404) throw new Error(`Folder not found: ${folder}`);
        throw new Error("Failed to fetch drafts");
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
}
