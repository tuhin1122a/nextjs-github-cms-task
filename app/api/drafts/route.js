import { NextResponse } from "next/server";

// -------------------------
// GitHub Configuration
// -------------------------
// These values are pulled from environment variables for security and flexibility
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * GET handler for fetching Markdown files from a GitHub repository.
 * This API route retrieves all files from the specified drafts folder,
 * filters for Markdown files, and fetches their content.
 */
export async function GET() {
  // Ensure GitHub token is set on the server
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GitHub token not set on server" },
      { status: 500 }
    );
  }

  // Default folder path is 'drafts' if not specified in environment
  const folderPath = process.env.NEXT_PUBLIC_DRAFTS_PATH || "drafts";

  // Construct GitHub API URL to fetch folder contents
  const URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folderPath}?ref=${BRANCH}`;

  try {
    // Fetch the list of files from GitHub
    const res = await fetch(URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`, // Use server-side token
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store", // Prevent caching for always up-to-date content
    });

    // Handle GitHub API errors
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody?.message || "Failed to fetch from GitHub" },
        { status: res.status }
      );
    }

    // Parse the JSON response containing file metadata
    const files = await res.json();

    // Filter for Markdown files and fetch their content
    const markdownFiles = await Promise.all(
      files
        .filter((f) => f.name.endsWith(".md")) // Only Markdown files
        .map(async (file) => {
          try {
            const fileRes = await fetch(file.download_url); // Fetch raw file content
            const content = await fileRes.text();
            return { ...file, content };
          } catch {
            // Return empty content if fetching fails
            return { ...file, content: "" };
          }
        })
    );

    // Return success response with Markdown files and their content
    return NextResponse.json({ success: true, data: markdownFiles });
  } catch (error) {
    // Catch any unexpected errors and return a generic error message
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
