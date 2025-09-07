"use client";

import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "markdown_drafts";

export function useDrafts() {
  // ------------------------
  // Initialize state from localStorage (SSR-safe)
  // ------------------------
  const [drafts, setDrafts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored).map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt), // Restore Date object
          }));
        }
      } catch (err) {
        console.error("Error parsing drafts from localStorage", err);
      }
    }
    return [];
  });

  // ------------------------
  // Persist drafts to localStorage whenever they change
  // ------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(
            drafts.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))
          )
        );
      } catch (err) {
        console.error("Error saving drafts to localStorage", err);
      }
    }
  }, [drafts]);

  // ------------------------
  // Add a new draft (new drafts appear at the top)
  // ------------------------
  const addDraft = (title, body) => {
    if (!title.trim() || !body.trim()) return;

    const newDraft = {
      id: nanoid(),
      title,
      body,
      createdAt: new Date(),
    };

    setDrafts((prev) => [newDraft, ...prev]);
  };

  // ------------------------
  // Update an existing draft
  // ------------------------
  const updateDraft = (id, title, body) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title, body } : d))
    );
  };

  // ------------------------
  // Delete a draft by ID
  // ------------------------
  const deleteDraft = (id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  // ------------------------
  // Clear all drafts
  // ------------------------
  const clearAllDrafts = () => setDrafts([]);

  return {
    drafts,
    addDraft,
    updateDraft,
    deleteDraft,
    clearAllDrafts,
  };
}
