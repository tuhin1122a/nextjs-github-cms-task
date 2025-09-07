"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup"; // ✅ HTML এর জন্য
import "prismjs/themes/prism.css"; // light theme
import { useEffect } from "react";

export function FileModal({ file, isOpen, onClose }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [file]);

  const renderer = new marked.Renderer();

  renderer.code = (code, language) => {
    const lang =
      typeof language === "string" && Prism.languages[language]
        ? language
        : "markup";
    const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
    return `<pre class="rounded-md bg-gray-100 p-4 overflow-x-auto">
              <code class="language-${lang}">${highlighted}</code>
            </pre>`;
  };

  const htmlContent = file?.content
    ? marked(file.content, { renderer })
    : "<em class='text-gray-500'>No content available</em>";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined} // ✅ warning fix
        className="max-w-4xl max-h-[80vh] overflow-auto bg-white border border-gray-300"
      >
        <DialogHeader className="border-b border-gray-300 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {file?.name || "File Content"}
          </DialogTitle>
          <DialogDescription>
            Preview of your markdown file from GitHub
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-300">
          <div
            className="prose max-w-none
                       prose-headings:text-gray-900
                       prose-p:text-gray-800
                       prose-strong:text-gray-900
                       prose-code:text-gray-800
                       prose-pre:bg-gray-100
                       overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
