"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

export function LocalDraftsList({
  drafts,
  onEdit,
  onDelete,
  onPublish,
  isPublishing,
  isEditing, // <-- pass this from parent (PublisherClient)
}) {
  const colors = [
    "bg-slate-100 border-slate-300",
    "bg-emerald-100 border-emerald-300",
    "bg-blue-100 border-blue-300",
    "bg-amber-100 border-amber-300",
    "bg-violet-100 border-violet-300",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const handleDragStart = (e, draft) => {
    e.dataTransfer.setData("application/json", JSON.stringify(draft));
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDeleteClick = (id) => {
    if (isEditing) return; // disable delete while editing
    onDelete(id);
  };

  const handleEditClick = (id) => {
    if (!isEditing) {
      onEdit(id);
    } else {
      toast.info("Finish editing the current draft first!");
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">
          Local Drafts ({drafts.length})
        </CardTitle>
        <p className="text-sm text-slate-600">
          Drag drafts to the left panel to publish
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
          {drafts.length === 0 ? (
            <p className="text-center py-8 text-slate-600">No drafts yet!</p>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                draggable
                onDragStart={(e) => handleDragStart(e, d)}
                onDragEnd={handleDragEnd}
                className={`rounded-lg p-4 flex justify-between items-start gap-2 shadow-sm cursor-move transition-opacity ${getRandomColor()}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 text-slate-400">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <circle cx="2" cy="2" r="1" />
                      <circle cx="6" cy="2" r="1" />
                      <circle cx="10" cy="2" r="1" />
                      <circle cx="2" cy="6" r="1" />
                      <circle cx="6" cy="6" r="1" />
                      <circle cx="10" cy="6" r="1" />
                      <circle cx="2" cy="10" r="1" />
                      <circle cx="6" cy="10" r="1" />
                      <circle cx="10" cy="10" r="1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-slate-800">
                      {d.title}
                    </h3>
                    <p className="text-sm line-clamp-2 text-slate-600">
                      {d.body.substring(0, 100)}
                      {d.body.length > 100 && "..."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(d.id)}
                    disabled={isEditing} // lock edit while another draft is editing
                    className={`h-8 w-8 border-slate-300 ${
                      isEditing
                        ? "bg-gray-200 cursor-not-allowed hover:bg-gray-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(d.id)}
                    disabled={isEditing} // lock delete while editing
                    className={`h-8 w-8 ${
                      isEditing ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {drafts.length > 0 && (
          <Button
            onClick={onPublish}
            disabled={isPublishing || isEditing} // disable publish while editing
            className={`w-full mt-4 ${
              isPublishing || isEditing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            size="lg"
          >
            {isPublishing
              ? "Publishing..."
              : `Publish All Drafts (${drafts.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
