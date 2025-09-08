"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DraftCard } from "../GitHubDraftsViewer/DraftCard";
import { FileModal } from "../GitHubDraftsViewer/FileModal";
import { Loader } from "../GitHubDraftsViewer/Loader";

export function GitHubDraftsViewer({
  files = [],
  loading = false,
  onDraftDrop,
  errorMessage,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const colors = [
    "bg-slate-100 border-slate-300",
    "bg-emerald-100 border-emerald-300",
    "bg-blue-100 border-blue-300",
    "bg-amber-100 border-amber-300",
    "bg-violet-100 border-violet-300",
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
      if (onDraftDrop && draft) onDraftDrop(draft);
    } catch (error) {
      console.error("Error parsing dropped draft:", error);
    }
  };

  // ✅ সব ফাইল দেখানোর জন্য
  const displayedFiles = Array.isArray(files) ? files : [];

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
            GitHub Drafts ({Array.isArray(files) ? files.length : 0} total)
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {isDragOver
              ? "Drop draft here to publish!"
              : "Drop zone for publishing drafts"}
          </p>
        </div>
      </CardHeader>

      {/* Scrollable Content */}
      <CardContent className="space-y-4 overflow-auto flex-1">
        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        {/* Drag Over Indicator */}
        {isDragOver && (
          <div className="border-2 border-dashed border-emerald-400 bg-emerald-100 rounded-lg p-8 text-center">
            <p className="text-emerald-700 font-medium">
              Release to publish draft
            </p>
          </div>
        )}

        {/* Loader / Files */}
        {loading ? (
          <Loader />
        ) : !displayedFiles.length ? (
          <p className="text-slate-600">
            No markdown files found in the GitHub repository.
          </p>
        ) : (
          displayedFiles.map((file) => (
            <DraftCard
              key={file.name}
              file={file}
              onView={handleViewFile}
              getColor={getRandomColor}
            />
          ))
        )}
      </CardContent>

      {/* File Modal */}
      <FileModal
        file={selectedFile}
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
      />
    </Card>
  );
}
