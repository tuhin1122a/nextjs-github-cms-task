import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

// GitHub configuration from environment variables
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH;
const COMMITTER = {
  name: process.env.GITHUB_COMMITTER_NAME,
  email: process.env.GITHUB_COMMITTER_EMAIL,
};
const DRAFTS_PATH = process.env.NEXT_PUBLIC_DRAFTS_PATH;

/**
 * Ensures that the drafts folder exists in the repository.
 */
async function ensureFolder(octokit) {
  try {
    await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path: DRAFTS_PATH, branch: BRANCH }
    );
  } catch (err) {
    if (err.status === 404) {
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
 * Retrieves the SHA of a file in the repository if it exists.
 */
async function getFileSha(octokit, path) {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path, branch: BRANCH }
    );
    return data.sha;
  } catch (err) {
    if (err.status === 404) return undefined;
    throw err;
  }
}

/**
 * Handles POST requests to publish a single draft.
 */
export async function POST(req) {
  try {
    const draft = await req.json();
    if (!draft?.title?.trim()) {
      return NextResponse.json(
        { error: "Invalid draft data" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not set" },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: token });

    await ensureFolder(octokit);

    const safeTitle = draft.title.replace(/[^a-zA-Z0-9-_]/g, "_");
    const path = `${DRAFTS_PATH}/${safeTitle}.md`;
    const content = Buffer.from(`# ${draft.title}\n\n${draft.body}`).toString(
      "base64"
    );

    const sha = await getFileSha(octokit, path);

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
        ...(sha && { sha }),
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
