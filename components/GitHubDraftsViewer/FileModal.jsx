"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { marked } from "marked";

export function FileModal({ file, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-slate-50 border-slate-200">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {file?.name || "File Content"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
          <div
            className="prose max-w-none prose-slate 
                       prose-headings:text-slate-900 
                       prose-p:text-slate-700 
                       prose-strong:text-slate-900 
                       prose-code:text-emerald-700 
                       prose-code:bg-emerald-50 
                       prose-pre:bg-slate-900 
                       prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{
              __html: file?.content
                ? marked(file.content)
                : "<em class='text-slate-500'>No content available</em>",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
