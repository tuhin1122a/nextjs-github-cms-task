export async function fetchMarkdownFilesFromGitHub(folderPath) {
  const REPO = "tuhin1122a/E-com-Store";
  const URL = `https://api.github.com/repos/${REPO}/contents/${folderPath}`;
  const token = process.env.GITHUB_TOKEN;

  if (!token) throw new Error("GitHub token not set");

  // Server-side fetch
  const res = await fetch(URL, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch folder contents: ${res.status}`);
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

      if (!fileRes.ok)
        throw new Error(
          `Failed to fetch file: ${file.name} (status: ${fileRes.status})`
        );

      const data = await fileRes.json();
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return { name: file.name, content };
    })
  );

  return contents;
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
