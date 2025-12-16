"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EmailEditor from "react-email-editor";
import type { AllowedEmailVariable } from "@/domains/emailTemplates/types/emailTemplates";

type Props = {
  allowedVariables: AllowedEmailVariable[];
  initialDesignJson: unknown;
  minHeight?: number;
  onEditorReady?: (api: any) => void;
  onLiveUpdate?: (args: { html: string; designJson: unknown }) => void;
  className?: string;
};

export default function EmailTemplateEditor({
  allowedVariables,
  initialDesignJson,
  minHeight = 900,
  onEditorReady,
  onLiveUpdate,
  className,
}: Props) {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const liveUpdateTimerRef = useRef<number | null>(null);

  const mergeTags = useMemo(() => {
    // Unlayer expects: { [name]: { name, value, sample } }
    const tags: Record<
      string,
      { name: string; value: string; sample?: string }
    > = {};
    for (const v of allowedVariables ?? []) {
      tags[v.name] = {
        name: v.label || v.name,
        value: `{{${v.name}}}`,
        sample: v.example,
      };
    }
    return tags;
  }, [allowedVariables]);

  useEffect(() => {
    if (!isReady) return;
    if (!editorRef.current?.editor) return;

    const api = editorRef.current.editor;
    onEditorReady?.(api);

    // If seed stored {}, treat it as no design.
    const designObj =
      initialDesignJson && typeof initialDesignJson === "object"
        ? (initialDesignJson as any)
        : null;

    const looksLikeDesign =
      designObj &&
      (designObj.body || designObj.counters || designObj.schemaVersion);

    if (looksLikeDesign) {
      try {
        api.loadDesign(designObj);
      } catch {
        // ignore invalid design
      }
    }

    // Live preview updates (debounced).
    if (onLiveUpdate && api?.addEventListener) {
      const handler = () => {
        if (liveUpdateTimerRef.current) {
          window.clearTimeout(liveUpdateTimerRef.current);
        }
        liveUpdateTimerRef.current = window.setTimeout(() => {
          try {
            let html = "";
            let designJson: any = {};
            api.exportHtml?.((data: any) => {
              html = String(data?.html ?? "");
              api.saveDesign?.((design: any) => {
                designJson = design ?? {};
                onLiveUpdate({ html, designJson });
              });
            });
          } catch {
            // ignore
          }
        }, 400);
      };

      api.addEventListener("design:updated", handler);
      return () => {
        try {
          api.removeEventListener?.("design:updated", handler);
        } catch {
          // ignore
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <div
      className={
        className ??
        "w-full bg-white overflow-hidden border border-gray-200 rounded-2xl"
      }
    >
      <EmailEditor
        ref={editorRef}
        minHeight={minHeight}
        options={{
          mergeTags,
        }}
        onReady={() => {
          setIsReady(true);
        }}
      />
    </div>
  );
}
