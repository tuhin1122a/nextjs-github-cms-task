"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // <-- import toast

export function DraftForm({ editingDraft, onAdd, onUpdate, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!editingDraft;

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

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Both Title and Body are required");
      return;
    }

    if (isEditing && editingDraft) {
      onUpdate(editingDraft.id, title.trim(), body.trim());
      toast.success("Draft updated successfully!"); // <-- toast on update
    } else {
      onAdd(title.trim(), body.trim());
      toast.success("Draft created successfully!"); // <-- toast on create
    }

    setTitle("");
    setBody("");
    setError("");
  };

  const inputStyle =
    "bg-white border border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800">
          {isEditing ? "Edit Draft" : "Create New Draft"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-slate-700">
              Body
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`min-h-[120px] resize-none ${inputStyle}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            disabled={!title && !body}
          >
            <Plus className="h-4 w-4" />
            {isEditing ? "Update Draft" : "Add Draft"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="w-full border-slate-300 hover:bg-slate-50 bg-transparent"
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </form>
    </Card>
  );
}
