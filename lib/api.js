// -------------------------------
// API Utility Functions
// -------------------------------

/**
 * Fetch all markdown drafts from the server.
 * Calls the `/api/drafts` endpoint to retrieve all drafts.
 *
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function fetchMarkdownDrafts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // Using no-store to prevent caching of drafts
    const res = await fetch(`${baseUrl}/api/drafts`, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok || data.error) {
      // Return a structured error object if the API call fails
      return { success: false, error: data.error || "Failed to fetch drafts" };
    }

    // Return the drafts in a success response
    return { success: true, data: data.data || [] };
  } catch (err) {
    // Catch network or unexpected errors
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Unknown error fetching drafts",
    };
  }
}

/**
 * Publish multiple drafts at once.
 * Calls the `/api/publish` endpoint with an array of drafts.
 *
 * @param {Array} drafts - Array of draft objects to publish
 * @returns {Promise<any>} - API response
 * @throws {Error} - Throws if the API response is not OK
 */
export async function publishAllDrafts(drafts) {
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drafts }),
  });

  if (!res.ok) {
    throw new Error(`Failed to publish drafts: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Publish a single draft.
 * Calls the `/api/publish-draft` endpoint with one draft object.
 *
 * @param {Object} draft - Single draft to publish
 * @returns {Promise<any>} - API response
 * @throws {Error} - Throws if the API response is not OK
 */
export async function publishSingleDraft(draft) {
  const res = await fetch("/api/publish-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  if (!res.ok) {
    throw new Error(`Failed to publish draft: ${res.statusText}`);
  }

  return res.json();
}
