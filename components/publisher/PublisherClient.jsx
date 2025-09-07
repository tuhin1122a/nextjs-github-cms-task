"use client";

import { useDrafts } from "@/hooks/useDrafts";
import { useGitHubFiles } from "@/hooks/useGitHubFiles";
import { publishAllDrafts, publishSingleDraft } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublishConfirmModal } from "../PublishConfirmModal";
import { DraftForm } from "./DraftForm";
import { GitHubDraftsViewer } from "./GitHubDraftsViewer";
import { LocalDraftsList } from "./LocalDraftsList";

export function PublisherClient({ initialFiles }) {
  const [mounted, setMounted] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    draft: null,
    message: "",
  });

  const { drafts, addDraft, updateDraft, deleteDraft, clearAllDrafts } =
    useDrafts();
  const {
    files,
    loading: githubLoading,
    refetch,
  } = useGitHubFiles("drafts", initialFiles);

  const editingDraft = drafts.find((d) => d.id === editingDraftId) || null;

  // Mounted for hydration safety
  useEffect(() => setMounted(true), []);

  // Delete with Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && drafts.length > 0 && !editingDraftId) {
        const draft = drafts[0];
        openConfirmModal({
          message: `Delete "${draft.title}"?`,
          draft,
          action: async (d) => {
            deleteDraft(d.id);
            toast.success(`"${d.title}" deleted successfully!`);
          },
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drafts, deleteDraft, editingDraftId]);

  // Handlers
  const handleUpdateDraft = (id, title, body) => {
    updateDraft(id, title, body);
    setEditingDraftId(null);
    toast.success("Draft updated successfully!");
  };

  const handleCancelEdit = () => setEditingDraftId(null);

  const openConfirmModal = ({ message, action, draft = null }) => {
    setConfirmModal({ open: true, message, action, draft });
  };

  const handleConfirm = async () => {
    if (!confirmModal.action) return;
    setConfirmModal({ ...confirmModal, open: false });
    await confirmModal.action(confirmModal.draft);
  };

  const handlePublishAll = () => {
    if (drafts.length === 0) {
      toast.error("No drafts to publish!");
      return;
    }

    openConfirmModal({
      message: `Publish ${drafts.length} draft(s)?`,
      action: async () => {
        setIsPublishing(true);
        try {
          const data = await publishAllDrafts(drafts);
          if (data.success) {
            toast.success("Drafts published successfully!");
            clearAllDrafts();
          } else {
            toast.error("Failed to publish drafts. Check console.");
            console.error("Publishing error:", data.message);
          }
          refetch();
        } catch (err) {
          console.error(err);
          toast.error("Error publishing drafts. See console.");
        } finally {
          setIsPublishing(false);
        }
      },
    });
  };

  const handlePublishDraft = (draft) => {
    openConfirmModal({
      message: `Publish "${draft.title}"?`,
      draft,
      action: async (d) => {
        setIsPublishing(true);
        try {
          const result = await publishSingleDraft(d);
          if (result.success) {
            toast.success(`"${d.title}" published successfully!`);
            refetch();
            deleteDraft(d.id);
          } else {
            toast.error(`Failed to publish "${d.title}": ${result.message}`);
          }
        } catch (error) {
          console.error("Error publishing draft:", error);
          toast.error("Error publishing draft. See console.");
        } finally {
          setIsPublishing(false);
        }
      },
    });
  };

  const handleDeleteDraft = (id) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    openConfirmModal({
      message: `Delete "${draft.title}"?`,
      draft,
      action: async (d) => {
        deleteDraft(d.id);
        toast.success(`"${d.title}" deleted successfully!`);
      },
    });
  };

  if (!mounted) return null;

  return (
    <>
      <main className="container mx-auto px-4 py-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left */}
        <div className="flex flex-col h-full order-2 lg:order-1">
          <GitHubDraftsViewer
            files={files}
            loading={githubLoading}
            onRefresh={refetch}
            onDraftDrop={handlePublishDraft}
          />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-6 h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm order-1 lg:order-2">
          <DraftForm
            editingDraft={editingDraft}
            onAdd={addDraft}
            onUpdate={handleUpdateDraft}
            onCancelEdit={handleCancelEdit}
          />
          <LocalDraftsList
            drafts={drafts}
            onEdit={(id) => {
              if (!editingDraftId) setEditingDraftId(id);
              else if (editingDraftId !== id)
                toast.info("Finish editing the current draft first!");
            }}
            onDelete={handleDeleteDraft}
            onPublish={handlePublishAll}
            isPublishing={isPublishing}
            isEditing={!!editingDraftId}
            refetch={refetch}
          />
        </div>
      </main>

      {/* Confirm Modal */}
      {confirmModal.open && (
        <PublishConfirmModal
          message={confirmModal.message}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
        />
      )}
    </>
  );
}
