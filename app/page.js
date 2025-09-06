import { PublisherClient } from "@/components/publisher/PublisherClient";
import { fetchMarkdownFilesFromGitHub } from "@/lib/api";
import { FileText } from "lucide-react";

export default async function MarkdownPublisherPage() {
  const initialFiles = await fetchMarkdownFilesFromGitHub("drafts");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--background)/0.95)] to-[hsl(var(--background)/1)]">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Markdown Publisher
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PublisherClient initialFiles={initialFiles} />
      </main>
    </div>
  );
}
