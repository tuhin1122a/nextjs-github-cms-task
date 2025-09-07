"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { marked } from "marked";
import { useState } from "react";

export function GitHubDraftsViewer({ files, loading, onRefresh, onDraftDrop }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const colors = [
    "bg-slate-50 border-slate-200",
    "bg-emerald-50 border-emerald-200",
    "bg-blue-50 border-blue-200",
    "bg-amber-50 border-amber-200",
    "bg-violet-50 border-violet-200",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const draftData = e.dataTransfer.getData("application/json");
      const draft = JSON.parse(draftData);

      if (onDraftDrop && draft) {
        onDraftDrop(draft);
      }
    } catch (error) {
      console.error("Error parsing dropped draft:", error);
    }
  };

  const latestFiles = Array.isArray(files) ? files.slice(0, 5) : [];

  return (
    <Card
      className={`bg-white shadow-sm border h-screen flex flex-col transition-all duration-200 ${
        isDragOver
          ? "border-emerald-400 bg-emerald-50 border-2"
          : "border-slate-200"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-slate-800">
            GitHub Drafts- ({Array.isArray(files) ? files.length : 0} total)
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {isDragOver
              ? "Drop draft here to publish!"
              : "Drop zone for publishing drafts"}
          </p>
        </div>
      </CardHeader>

      {/* Scrollable Card Content */}
      <CardContent className="space-y-4 overflow-auto flex-1">
        {isDragOver && (
          <div className="border-2 border-dashed border-emerald-400 bg-emerald-100 rounded-lg p-8 text-center">
            <p className="text-emerald-700 font-medium">
              Release to publish draft
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : !Array.isArray(files) || files.length === 0 ? (
          <p className="text-slate-600">
            No markdown files found in the GitHub repository.
          </p>
        ) : (
          latestFiles.map((file) => (
            <Card
              key={file.name}
              className={`${getRandomColor()} rounded-lg shadow-sm`}
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  {file.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewFile(file)}
                  className="h-8 w-8 p-0 hover:bg-slate-200"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>
              </CardHeader>
            </Card>
          ))
        )}
      </CardContent>

      {/* File Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-slate-50 border-slate-200">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {selectedFile?.name || "File Content"}
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
                __html: selectedFile?.content
                  ? marked(selectedFile.content)
                  : "<em class='text-slate-500'>No content available</em>",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
