"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * DraftForm Component
 * - Handles creation and editing of drafts
 * - Validates input and manages local form state
 */
export function DraftForm({ editingDraft, onAdd, onUpdate, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!editingDraft;

  // Populate form when editing a draft, reset when not editing
  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.title);
      setBody(editingDraft.body);
    } else {
      setTitle("");
      setBody("");
    }
    setError("");
  }, [editingDraft]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setError("");
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    // Validation
    if (!title.trim() || !body.trim()) {
      setError("Both Title and Body are required");
      return;
    }

    if (isEditing) {
      onUpdate(editingDraft.id, title.trim(), body.trim());
    } else {
      onAdd(title.trim(), body.trim());
    }

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  const inputStyle =
    "bg-white border border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-md";

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800">
          {isEditing ? "Edit Draft" : "Create New Draft"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter draft title"
              className={inputStyle}
              autoFocus={isEditing} // focus when editing
              required
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-slate-700">
              Body
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter draft content"
              className={`min-h-[120px] resize-none ${inputStyle}`}
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
            disabled={!title.trim() || !body.trim()}
          >
            <Plus className="h-4 w-4" />
            {isEditing ? "Update Draft" : "Add Draft"}
          </Button>

          {/* Cancel Edit Button */}
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full border-slate-300 hover:bg-slate-50 bg-transparent focus:ring-2 focus:ring-emerald-300 focus:outline-none"
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </form>
    </Card>
  );
}
