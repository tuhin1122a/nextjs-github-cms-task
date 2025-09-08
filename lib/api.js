// export async function fetchMarkdownFilesFromGitHub(folderPath) {
//   const REPO = "tuhin1122a/E-com-Store";
//   const URL = `https://api.github.com/repos/${REPO}/contents/${folderPath}`;
//   const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN; // Make sure it's NEXT_PUBLIC for client fetch

//   if (!token) {
//     return { error: "GitHub token not set. Please configure your token." };
//   }

//   try {
//     const res = await fetch(URL, {
//       headers: {
//         Authorization: `token ${token}`,
//       },
//     });

//     if (!res.ok) {
//       if (res.status === 401) {
//         return { error: "Unauthorized: Invalid or missing GitHub token." };
//       }
//       if (res.status === 403) {
//         return { error: "Forbidden: Check token scopes or rate limit." };
//       }
//       if (res.status === 404) {
//         return { error: `Folder not found: ${folderPath}` };
//       }
//       return {
//         error: `Failed to fetch folder contents (status: ${res.status})`,
//       };
//     }

//     const files = await res.json();

//     const markdownFiles = files.filter(
//       (f) => f.type === "file" && f.name.endsWith(".md")
//     );

//     const contents = await Promise.all(
//       markdownFiles.map(async (file) => {
//         const fileRes = await fetch(file.url, {
//           headers: { Authorization: `token ${token}` },
//         });
//         if (!fileRes.ok) {
//           return {
//             name: file.name,
//             content: "",
//             error: `Failed to fetch file: ${file.name}`,
//           };
//         }
//         const data = await fileRes.json();
//         const content = Buffer.from(data.content, "base64").toString("utf-8");
//         return { name: file.name, content };
//       })
//     );

//     return { data: contents };
//   } catch (err) {
//     return { error: err.message || "Unknown error fetching GitHub files." };
//   }
// }

// Server-side API call to publish drafts
export async function fetchMarkdownDrafts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/drafts`, { cache: "no-store" }); // no-store to prevent caching
    const data = await res.json();

    if (!res.ok || data.error) {
      return { success: false, error: data.error || "Failed to fetch drafts" };
    }

    return { success: true, data: data.data || [] };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Unknown error fetching drafts",
    };
  }
}

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
