"use client";

import { useCallback, useEffect, useState } from "react";

export function useGitHubFiles(initialFiles = []) {
  const [files, setFiles] = useState(initialFiles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/drafts`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch drafts");
      }

      setFiles(data.data || []); // API থেকে আসা "data" ব্যবহার করা হচ্ছে
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
}
