"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { colors } from "@/lib/utils";
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

  // Display all files except the last one
  const displayedFiles =
    Array.isArray(files) && files.length > 1
      ? files.slice(0, files.length - 1)
      : [];

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

        {/* Loader */}
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
