import { NextResponse } from "next/server";

// GitHub configuration from environment variables
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET() {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GitHub token not set on server" },
      { status: 500 }
    );
  }

  const folderPath = process.env.NEXT_PUBLIC_DRAFTS_PATH || "drafts";
  const URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folderPath}?ref=${BRANCH}`;

  try {
    const res = await fetch(URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody?.message || "Failed to fetch from GitHub" },
        { status: res.status }
      );
    }

    const files = await res.json();

    // Fetch the content of markdown files only
    const markdownFiles = await Promise.all(
      files
        .filter((f) => f.name.endsWith(".md"))
        .map(async (file) => {
          try {
            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();
            return { ...file, content };
          } catch {
            return { ...file, content: "" };
          }
        })
    );

    return NextResponse.json({ success: true, data: markdownFiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
