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
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    draft: null,
    message: "",
  });

  const {
    files,
    loading: githubLoading,
    refetch,
  } = useGitHubFiles("drafts", initialFiles);
  const { drafts, addDraft, updateDraft, deleteDraft, clearAllDrafts } =
    useDrafts();

  const editingDraft = drafts.find((d) => d.id === editingDraftId) || null;

  // =========================
  // Handlers
  // =========================
  const handleUpdateDraft = (id, title, body) => {
    updateDraft(id, title, body);
    setEditingDraftId(null);
  };
  const handleCancelEdit = () => setEditingDraftId(null);

  // Open confirm modal
  const openConfirmModal = ({ message, action, draft = null }) => {
    setConfirmModal({ open: true, message, action, draft });
  };

  // Execute confirm action
  const handleConfirm = async () => {
    if (!confirmModal.action) return;
    setConfirmModal({ ...confirmModal, open: false });
    await confirmModal.action(confirmModal.draft);
  };

  // =========================
  // Publish / Delete Handlers
  // =========================

  // Publish all drafts
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

  // Single draft publish (drag-drop)
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

  // Delete draft with modal
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

  // Delete first/top draft with Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && drafts.length > 0) {
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
  }, [drafts, deleteDraft]);

  // =========================
  // JSX
  // =========================
  return (
    <>
      <main className="container mx-auto px-4 py-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column */}
        <div className="flex flex-col h-full">
          <GitHubDraftsViewer
            files={files}
            loading={githubLoading}
            onRefresh={refetch}
            onDraftDrop={handlePublishDraft} // drag-drop publish
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <DraftForm
            editingDraft={editingDraft}
            onAdd={addDraft}
            onUpdate={handleUpdateDraft}
            onCancel={handleCancelEdit}
          />
          <LocalDraftsList
            drafts={drafts}
            onEdit={setEditingDraftId}
            onDelete={handleDeleteDraft}
            onPublish={handlePublishAll}
            isPublishing={isPublishing}
            refetch={refetch}
          />
        </div>
      </main>

      {/* ================= Confirm Modal ================= */}
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
