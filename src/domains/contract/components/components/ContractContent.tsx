import { useEffect, useRef } from "react";

interface ContractContentProps {
  processedHtml: string;
}

export const ContractContent = ({ processedHtml }: ContractContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>("");
  const signaturePreservedRef = useRef<string>("");

  useEffect(() => {
    if (!contentRef.current) return;

    // Only update innerHTML if the HTML actually changed
    // This prevents clearing dynamically added elements (like signature) on re-renders
    if (processedHtml !== lastHtmlRef.current) {
      // Preserve signature before updating
      const signatureContainer = contentRef.current.querySelector<HTMLElement>(
        "#contract-dynamic-examiner-signature",
      );
      const signatureHtml = signatureContainer?.innerHTML || "";
      if (signatureHtml) {
        signaturePreservedRef.current = signatureHtml;
      }

      // Update the HTML
      contentRef.current.innerHTML =
        processedHtml || "<div>Sample Contract Content Here</div>";

      // Restore signature if it existed
      if (signaturePreservedRef.current) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (!contentRef.current) return;

          const newSignatureContainer =
            contentRef.current.querySelector<HTMLElement>(
              "#contract-dynamic-examiner-signature",
            );
          if (newSignatureContainer) {
            newSignatureContainer.innerHTML = signaturePreservedRef.current;
          } else {
            // Re-create signature container if it was removed
            const examinerLabel = findSignatureBlock(contentRef.current);
            if (examinerLabel) {
              const newContainer = document.createElement("div");
              newContainer.id = "contract-dynamic-examiner-signature";
              newContainer.style.marginTop = "8px";
              newContainer.style.minHeight = "60px";
              newContainer.style.display = "flex";
              newContainer.style.alignItems = "flex-start";
              newContainer.style.gap = "12px";
              newContainer.innerHTML = signaturePreservedRef.current;
              examinerLabel.insertAdjacentElement("afterend", newContainer);
            }
          }
        }, 0);
      }

      lastHtmlRef.current = processedHtml;
    }
  }, [processedHtml]);

  const findSignatureBlock = (container: HTMLElement) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    const normalized = (value: string | null | undefined) =>
      value
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim() ?? "";

    const blockTags = new Set([
      "P",
      "DIV",
      "SECTION",
      "ARTICLE",
      "TABLE",
      "TBODY",
      "TR",
      "TD",
      "LI",
      "UL",
      "OL",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
    ]);

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (normalized(textNode.textContent).includes("examiner signature")) {
        let el = textNode.parentElement;
        while (el && !blockTags.has(el.tagName)) {
          el = el.parentElement;
        }
        return el ?? textNode.parentElement ?? null;
      }
    }

    return null;
  };

  return (
    <div
      className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-white rounded-[20px]"
      style={{
        padding: "40px 50px",
        maxWidth: "210mm",
        lineHeight: "1.4",
        boxShadow: "0px 0px 36.35px 0px #00000008",
        height: "calc(100vh - 100px)",
      }}
    >
      <div
        ref={contentRef}
        id="contract"
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none font-poppins"
      />
    </div>
  );
};
