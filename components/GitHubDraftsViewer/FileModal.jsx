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
import "prismjs/components/prism-markup"; // HTML
import "prismjs/themes/prism.css"; // Light GitHub-style theme
import { useEffect, useRef } from "react";

export function FileModal({ file, isOpen, onClose }) {
  const contentRef = useRef(null);

  // Pick content intelligently: GitHub files have 'content', local drafts have 'body'
  const markdownContent = file?.content ?? file?.body ?? "";

  useEffect(() => {
    if (contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => Prism.highlightElement(block));
    }
  }, [markdownContent]);

  const renderer = new marked.Renderer();

  renderer.code = (code, language) => {
    let codeString = "";

    if (typeof code === "object" && code !== null) {
      if ("text" in code) {
        codeString = code.text;
      } else if ("raw" in code) {
        codeString = code.raw;
      } else {
        codeString = JSON.stringify(code, null, 2);
      }
    } else {
      codeString = String(code || "");
    }

    const lang =
      typeof language === "string" && Prism.languages[language]
        ? language
        : "markup";

    const highlighted = Prism.highlight(
      codeString,
      Prism.languages[lang],
      lang
    );

    return `<pre class="rounded-md bg-gray-100 p-4 overflow-x-auto">
              <code class="language-${lang}">${highlighted}</code>
            </pre>`;
  };

  const htmlContent =
    markdownContent.length > 0
      ? marked(markdownContent, { renderer })
      : "<em class='text-gray-500'>No content available</em>";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white border border-gray-300 flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-gray-300 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {file?.name || file?.title || "File Content"}
          </DialogTitle>
          <DialogDescription>Preview of your markdown file</DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="mt-4 p-4 bg-white rounded-lg border border-gray-300 prose max-w-none
                     prose-headings:text-gray-900
                     prose-p:text-gray-800
                     prose-strong:text-gray-900
                     prose-code:text-pink-600
                     prose-pre:bg-gray-100
                     overflow-auto flex-1"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </DialogContent>
    </Dialog>
  );
}
