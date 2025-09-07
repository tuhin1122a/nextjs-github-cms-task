export async function fetchMarkdownFilesFromGitHub(folderPath) {
  const REPO = "tuhin1122a/E-com-Store";
  const URL = `https://api.github.com/repos/${REPO}/contents/${folderPath}`;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("❌ GitHub token not set in environment variables");
  }

  try {
    const res = await fetch(URL, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("❌ Unauthorized: Invalid or missing GitHub token");
      }
      if (res.status === 403) {
        throw new Error(
          "❌ Forbidden: Check GitHub token scopes (needs repo access)"
        );
      }
      if (res.status === 404) {
        throw new Error(`❌ Folder not found: ${folderPath}`);
      }
      throw new Error(
        `❌ Failed to fetch folder contents (status: ${res.status})`
      );
    }

    const files = await res.json();

    const markdownFiles = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".md")
    );

    const contents = await Promise.all(
      markdownFiles.map(async (file) => {
        const fileRes = await fetch(file.url, {
          headers: { Authorization: `token ${token}` },
        });

        if (!fileRes.ok) {
          throw new Error(
            `❌ Failed to fetch file: ${file.name} (status: ${fileRes.status})`
          );
        }

        const data = await fileRes.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        return { name: file.name, content };
      })
    );

    return contents;
  } catch (err) {
    console.error("🚨 Error fetching markdown files:", err.message);
    throw err; // rethrow so caller can handle in UI
  }
}

// Server-side API call to publish drafts
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

// Server-side API call to publish a single draft
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
