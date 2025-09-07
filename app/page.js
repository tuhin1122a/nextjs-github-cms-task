import { PublisherClient } from "@/components/publisher/PublisherClient";
import { fetchMarkdownFilesFromGitHub } from "@/lib/api";
import { FileText } from "lucide-react";

export default async function MarkdownPublisherPage() {
  const initialFiles = await fetchMarkdownFilesFromGitHub("drafts");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-slate-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <FileText className="h-8 w-8 text-emerald-400" />
          <h1 className="text-2xl font-bold">Markdown Publisher</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PublisherClient initialFiles={initialFiles} />
      </main>
    </div>
  );
}
