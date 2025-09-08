"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook: useGitHubFiles
 * ----------------------------
 * Fetches Markdown files (drafts) from the GitHub repository via a Next.js API route.
 * Handles loading state, errors, and provides a refetch function for reloading files.
 *
 * @param {Array} initialFiles - Optional initial list of files to populate state
 * @returns {Object} { files, loading, error, refetch }
 */
export function useGitHubFiles(initialFiles = []) {
  const [files, setFiles] = useState(initialFiles); // Stores fetched GitHub files
  const [loading, setLoading] = useState(true); // Loading indicator for UI feedback
  const [error, setError] = useState(null); // Error message if fetching fails

  /**
   * Fetches the list of drafts from the API endpoint `/api/drafts`.
   * Wrapped in useCallback to prevent unnecessary re-creations.
   */
  const fetchFiles = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null); // Reset previous error

    try {
      const res = await fetch(`/api/drafts`, { cache: "no-store" });
      const data = await res.json();

      // Handle API errors
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch drafts");
      }

      // Update files state with the fetched data
      setFiles(data.data || []);
    } catch (err) {
      // Store error message for UI display
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  }, []);

  /**
   * Initial fetch when the component mounts
   */
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Expose state and refetch function for consuming components
  return { files, loading, error, refetch: fetchFiles };
}
