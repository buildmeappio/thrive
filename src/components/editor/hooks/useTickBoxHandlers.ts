import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Editor } from "@tiptap/react";

/**
 * Hook for tick box handling
 * Handles tick box insertion (single or grouped)
 */
export function useTickBoxHandlers(editor: Editor | null) {
  const [showTickBoxInput, setShowTickBoxInput] = useState(false);
  const [tickBoxLabels, setTickBoxLabels] = useState("");

  const addTickBox = useCallback(() => {
    setTickBoxLabels("");
    setShowTickBoxInput(true);
  }, []);

  const applyTickBox = useCallback(() => {
    if (!editor) return;

    const labels = tickBoxLabels
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (labels.length === 0) {
      toast.error("Please enter at least one label");
      return;
    }

    if (labels.length === 1) {
      // Single tick box
      editor
        .chain()
        .focus()
        .setTickBox({
          label: labels[0],
          tickBoxId: `tick-box-${Date.now()}`,
          checked: false,
        })
        .run();
    } else {
      // Multiple tick boxes in a group
      editor
        .chain()
        .focus()
        .setTickBoxGroup({
          labels,
          group: `tick-group-${Date.now()}`,
        })
        .run();
    }

    setShowTickBoxInput(false);
    setTickBoxLabels("");
  }, [editor, tickBoxLabels]);

  return {
    showTickBoxInput,
    setShowTickBoxInput,
    tickBoxLabels,
    setTickBoxLabels,
    addTickBox,
    applyTickBox,
  };
}

