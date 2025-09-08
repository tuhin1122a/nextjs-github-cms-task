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

/**
 * PublisherClient component manages local drafts and GitHub drafts.
 * Handles creation, editing, deletion, and publishing of markdown drafts.
 */
export function PublisherClient({ initialFiles }) {
  const [mounted, setMounted] = useState(false); // Ensure hydration safety
  const [editingDraftId, setEditingDraftId] = useState(null); // Currently edited draft ID
  const [isPublishing, setIsPublishing] = useState(false); // Publishing state
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

  // -------------------------------
  // Effects
  // -------------------------------

  // Ensure component is mounted to prevent SSR hydration issues
  useEffect(() => setMounted(true), []);

  // Keyboard shortcut: Delete key deletes the first draft if no draft is being edited
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

  // -------------------------------
  // Handlers
  // -------------------------------

  /**
   * Updates an existing draft.
   * Called when DraftForm is submitted in edit mode.
   */
  const handleUpdateDraft = (id, title, body) => {
    updateDraft(id, title, body);
    setEditingDraftId(null);
    toast.success("Draft updated successfully!");
  };

  /**
   * Cancels editing mode and resets editingDraftId.
   */
  const handleCancelEdit = () => setEditingDraftId(null);

  /**
   * Opens the confirmation modal with a message and action callback.
   * Used for delete or publish confirmation.
   */
  const openConfirmModal = ({ message, action, draft = null }) => {
    setConfirmModal({ open: true, message, action, draft });
  };

  /**
   * Executes the action defined in the confirmation modal.
   */
  const handleConfirm = async () => {
    if (!confirmModal.action) return;
    setConfirmModal({ ...confirmModal, open: false });
    await confirmModal.action(confirmModal.draft);
  };

  /**
   * Publishes all local drafts after confirmation.
   */
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
            clearAllDrafts(); // Remove all local drafts after publishing
          } else {
            toast.error("Failed to publish drafts. Check console for details.");
            console.error("Publishing error:", data.message);
          }
          refetch(); // Refresh GitHub draft list
        } catch (err) {
          console.error("Error publishing drafts:", err);
          toast.error("Error publishing drafts. See console for details.");
        } finally {
          setIsPublishing(false);
        }
      },
    });
  };

  /**
   * Publishes a single draft after confirmation.
   */
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
            deleteDraft(d.id); // Remove the published draft locally
          } else {
            toast.error(`Failed to publish "${d.title}": ${result.message}`);
          }
        } catch (error) {
          console.error("Error publishing draft:", error);
          toast.error("Error publishing draft. See console for details.");
        } finally {
          setIsPublishing(false);
        }
      },
    });
  };

  /**
   * Deletes a draft locally after confirmation.
   */
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

  // -------------------------------
  // Render
  // -------------------------------

  if (!mounted) return null; // Prevent rendering during SSR

  return (
    <>
      <main className="container mx-auto px-4 py-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Panel: GitHub Drafts */}
        <div className="flex flex-col h-full order-2 lg:order-1">
          <GitHubDraftsViewer
            files={files}
            loading={githubLoading}
            onRefresh={refetch}
            onDraftDrop={handlePublishDraft}
          />
        </div>

        {/* Right Panel: Local Drafts & Draft Form */}
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

      {/* Confirmation Modal */}
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
