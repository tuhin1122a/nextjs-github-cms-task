"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export function PublishConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 w-80 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-900">
            Confirmation
          </h3>
          <p className="text-sm text-slate-700 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={onConfirm}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              OK
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
