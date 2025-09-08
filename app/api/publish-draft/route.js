import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

// -------------------------
// GitHub Configuration
// -------------------------
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER; // Repository owner
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO; // Repository name
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH; // Branch to commit to
const COMMITTER = {
  name: process.env.GITHUB_COMMITTER_NAME, // Commit author name
  email: process.env.GITHUB_COMMITTER_EMAIL, // Commit author email
};
const DRAFTS_PATH = process.env.NEXT_PUBLIC_DRAFTS_PATH; // Path to drafts folder

/**
 * Ensures that the drafts folder exists in the repository.
 * Creates a `.gitkeep` file if the folder does not exist.
 */
async function ensureFolder(octokit) {
  try {
    await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path: DRAFTS_PATH, branch: BRANCH }
    );
  } catch (err) {
    if (err.status === 404) {
      // Folder does not exist, create it using a .gitkeep file
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: OWNER,
        repo: REPO,
        path: `${DRAFTS_PATH}/.gitkeep`,
        message: "Create drafts folder",
        content: Buffer.from("").toString("base64"),
        branch: BRANCH,
        committer: COMMITTER,
      });
    } else {
      throw new Error(err.message || "Error checking folder");
    }
  }
}

/**
 * Retrieves the SHA of a file in the repository.
 * Returns `undefined` if the file does not exist.
 */
async function getFileSha(octokit, path) {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path, branch: BRANCH }
    );
    return data.sha;
  } catch (err) {
    if (err.status === 404) return undefined; // File does not exist
    throw err; // Propagate other errors
  }
}

/**
 * POST handler to publish a single draft to GitHub.
 * Accepts draft data with `title` and `body` fields in the request body.
 */
export async function POST(req) {
  try {
    const draft = await req.json();

    // Validate draft data
    if (!draft?.title?.trim()) {
      return NextResponse.json(
        { error: "Invalid draft data" },
        { status: 400 }
      );
    }

    // Ensure GitHub token is available
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not set" },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: token });

    // Ensure drafts folder exists
    await ensureFolder(octokit);

    // Sanitize title to create a safe file name
    const safeTitle = draft.title.replace(/[^a-zA-Z0-9-_]/g, "_");
    const path = `${DRAFTS_PATH}/${safeTitle}.md`;

    // Encode draft content in Base64 for GitHub API
    const content = Buffer.from(`# ${draft.title}\n\n${draft.body}`).toString(
      "base64"
    );

    // Check if file already exists to determine whether to create or update
    const sha = await getFileSha(octokit, path);

    // Commit draft to GitHub
    const res = await octokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        owner: OWNER,
        repo: REPO,
        path,
        message: sha
          ? `Update draft ${draft.title}`
          : `Create draft ${draft.title}`,
        committer: COMMITTER,
        content,
        branch: BRANCH,
        ...(sha && { sha }), // Include SHA if updating an existing file
      }
    );

    return NextResponse.json({
      success: true,
      message: `Draft "${draft.title}" published successfully`,
      response: res.data,
    });
  } catch (err) {
    console.error("Error publishing draft:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to publish draft" },
      { status: 500 }
    );
  }
}
