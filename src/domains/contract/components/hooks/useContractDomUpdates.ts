import { useEffect } from "react";
import { UseContractDomUpdatesProps } from "../../types/contract.types";

export const useContractDomUpdates = ({
  contractHtml,
  signatureImage,
  sigName,
  sigDate,
  checkboxValues,
  checkboxGroups,
}: UseContractDomUpdatesProps) => {
  useEffect(() => {
    const contractEl = document.getElementById("contract");
    if (!contractEl) return;

    const updateTargets = (
      selectors: string[],
      updater: (el: HTMLElement) => void,
    ): boolean => {
      let matched = false;
      selectors.forEach((selector) => {
        contractEl.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          matched = true;
          updater(el);
        });
      });
      return matched;
    };

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

    const findSignatureBlock = () => {
      const walker = document.createTreeWalker(
        contractEl,
        NodeFilter.SHOW_TEXT,
      );

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

    const findDateFieldAfterSignature = () => {
      const examinerLabel = findSignatureBlock();
      if (!examinerLabel) return null;

      let current: Element | null = examinerLabel;
      let checkedCount = 0;
      const maxChecks = 10;

      while (current && checkedCount < maxChecks) {
        const nextElement: Element | null = current.nextElementSibling;
        if (nextElement) {
          const nextSibling = nextElement as HTMLElement | null;
          const text = normalized(nextSibling?.textContent || "");
          if (
            text.includes("date") &&
            !text.includes("effective date") &&
            !text.includes("for platform")
          ) {
            return nextSibling;
          }
          current = nextElement;
        } else {
          const parent = current.parentElement;
          if (parent && parent !== contractEl) {
            const parentNext = parent.nextElementSibling;
            if (parentNext) {
              const text = normalized(parentNext.textContent || "");
              if (
                text.includes("date") &&
                !text.includes("effective date") &&
                !text.includes("for platform")
              ) {
                return parentNext as HTMLElement;
              }
            }
          }
          break;
        }
        checkedCount++;
      }

      const dateWalker = document.createTreeWalker(
        contractEl,
        NodeFilter.SHOW_TEXT,
      );

      let foundExaminerSignature = false;
      while (dateWalker.nextNode()) {
        const textNode = dateWalker.currentNode as Text;
        const text = normalized(textNode.textContent);

        if (text.includes("examiner signature")) {
          foundExaminerSignature = true;
          continue;
        }

        if (foundExaminerSignature) {
          if (
            text.includes("date") &&
            !text.includes("effective date") &&
            !text.includes("for platform")
          ) {
            let el = textNode.parentElement;
            while (el && !blockTags.has(el.tagName)) {
              el = el.parentElement;
            }
            return el ?? textNode.parentElement ?? null;
          }

          if (blockTags.has(textNode.parentElement?.tagName || "")) {
            break;
          }
        }
      }

      return null;
    };

    const ensureDynamicContainer = () => {
      let dynamicContainer = contractEl.querySelector<HTMLElement>(
        "#contract-dynamic-examiner-signature",
      );

      if (!dynamicContainer) {
        const examinerLabel = findSignatureBlock();
        if (examinerLabel) {
          dynamicContainer = document.createElement("div");
          dynamicContainer.id = "contract-dynamic-examiner-signature";
          dynamicContainer.style.marginTop = "8px";
          dynamicContainer.style.minHeight = "60px";
          dynamicContainer.style.display = "flex";
          dynamicContainer.style.alignItems = "flex-start";
          dynamicContainer.style.gap = "12px";
          examinerLabel.insertAdjacentElement("afterend", dynamicContainer);
        }
      }

      return dynamicContainer;
    };

    // Update signature image targets
    const hasImageTarget = updateTargets(
      [
        '[data-contract-signature="image"]',
        '[data-signature="examiner"]',
        "#examiner-signature",
        ".examiner-signature",
      ],
      (el) => {
        if (signatureImage) {
          el.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
        } else {
          el.innerHTML = "";
        }
      },
    );

    const dynamicContainer = hasImageTarget ? null : ensureDynamicContainer();

    if (dynamicContainer) {
      if (signatureImage) {
        dynamicContainer.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
      } else {
        dynamicContainer.innerHTML = "";
      }
    } else if (!hasImageTarget && signatureImage) {
      let fallback = contractEl.querySelector<HTMLElement>(
        "#contract-dynamic-examiner-signature",
      );
      if (!fallback) {
        fallback = document.createElement("div");
        fallback.id = "contract-dynamic-examiner-signature";
        fallback.style.marginTop = "12px";
        fallback.style.minHeight = "60px";
        fallback.style.display = "flex";
        fallback.style.alignItems = "flex-start";
        fallback.style.gap = "12px";
        contractEl.appendChild(fallback);
      }
      fallback.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
    } else if (!signatureImage) {
      const fallback = contractEl.querySelector<HTMLElement>(
        "#contract-dynamic-examiner-signature",
      );
      fallback?.remove();
    }

    const formattedDate = sigDate
      ? new Date(sigDate).toLocaleDateString("en-CA")
      : "";

    const dateField = findDateFieldAfterSignature();
    if (dateField && formattedDate) {
      const currentText = dateField.textContent || "";
      const normalizedCurrent = normalized(currentText);

      if (
        normalizedCurrent.includes("date") &&
        !currentText.includes(formattedDate)
      ) {
        const underscorePattern = /_{10,}/g;
        const textWithDateReplaced = currentText.replace(
          underscorePattern,
          formattedDate,
        );

        const finalText =
          textWithDateReplaced !== currentText
            ? textWithDateReplaced
            : currentText.trim().endsWith(":")
              ? `${currentText.trim()} ${formattedDate}`
              : currentText.trim()
                ? `${currentText.trim()}: ${formattedDate}`
                : `Date: ${formattedDate}`;

        const dateInput = dateField.querySelector<HTMLElement>(
          "input, span, div, p",
        );
        if (dateInput) {
          const inputText = dateInput.textContent || "";
          if (!inputText.includes(formattedDate)) {
            const inputWithDateReplaced = inputText.replace(
              underscorePattern,
              formattedDate,
            );
            if (inputWithDateReplaced !== inputText) {
              dateInput.textContent = inputWithDateReplaced;
            } else {
              dateInput.textContent = inputText.trim().endsWith(":")
                ? `${inputText.trim()} ${formattedDate}`
                : `${inputText.trim()}: ${formattedDate}`;
            }
          }
        } else {
          const textNodes = Array.from(dateField.childNodes).filter(
            (node) => node.nodeType === Node.TEXT_NODE,
          );
          if (textNodes.length > 0) {
            const textNode = textNodes[0] as Text;
            const nodeText = textNode.textContent || "";
            if (!nodeText.includes(formattedDate)) {
              const nodeWithDateReplaced = nodeText.replace(
                underscorePattern,
                formattedDate,
              );
              if (nodeWithDateReplaced !== nodeText) {
                textNode.textContent = nodeWithDateReplaced;
              } else {
                textNode.textContent = nodeText.trim().endsWith(":")
                  ? `${nodeText.trim()} ${formattedDate}`
                  : `${nodeText.trim()}: ${formattedDate}`;
              }
            }
          } else {
            if (!currentText.includes(formattedDate)) {
              dateField.textContent = finalText;
            }
          }
        }
      }
    }

    updateTargets(
      [
        '[data-contract-signature="name"]',
        "#examiner-signature-name",
        ".examiner-signature-name",
      ],
      (el) => {
        el.textContent = sigName || "";
      },
    );

    updateTargets(
      [
        '[data-contract-signature="date"]',
        "#examiner-signature-date",
        ".examiner-signature-date",
      ],
      (el) => {
        el.textContent = formattedDate;
      },
    );

    // Restore checkbox states after signature/date/name updates
    if (checkboxGroups.length > 0 && Object.keys(checkboxValues).length > 0) {
      checkboxGroups.forEach((group) => {
        const currentValues = checkboxValues[group.variableKey] || [];
        group.options.forEach((opt) => {
          const isChecked = currentValues.includes(opt.value);

          const allParagraphs = contractEl.querySelectorAll<HTMLElement>("p");
          allParagraphs.forEach((p) => {
            const text = p.textContent?.trim() || "";
            const labelMatch = text.match(/^[☐☑]\s*(.+)$/);
            if (labelMatch) {
              const labelText = labelMatch[1].trim();
              const matches =
                labelText.toLowerCase() === opt.label.toLowerCase();

              if (matches) {
                let checkboxSpan = p.querySelector(
                  "span.checkbox-indicator",
                ) as HTMLElement | null;

                if (!checkboxSpan) {
                  checkboxSpan = document.createElement("span");
                  checkboxSpan.className = "checkbox-indicator";
                  checkboxSpan.style.display = "inline-block";
                  checkboxSpan.style.marginRight = "4px";
                  checkboxSpan.style.padding = "2px 4px";
                  checkboxSpan.style.borderRadius = "4px";
                  checkboxSpan.style.cursor = "pointer";

                  const restOfText = text.substring(1).trim();
                  checkboxSpan.textContent = isChecked ? "☑" : "☐";

                  p.textContent = "";
                  p.appendChild(checkboxSpan);
                  if (restOfText) {
                    p.appendChild(document.createTextNode(" " + restOfText));
                  }
                } else {
                  checkboxSpan.textContent = isChecked ? "☑" : "☐";
                }

                if (checkboxSpan) {
                  checkboxSpan.style.backgroundColor = isChecked
                    ? "#e3f2fd"
                    : "transparent";
                }

                p.style.backgroundColor = "transparent";

                if (isChecked) {
                  p.setAttribute("data-checkbox-checked", "true");
                  p.setAttribute("data-checkbox-value", opt.value);
                } else {
                  p.removeAttribute("data-checkbox-checked");
                  p.removeAttribute("data-checkbox-value");
                }
              }
            }
          });
        });
      });
    }
  }, [
    contractHtml,
    signatureImage,
    sigName,
    sigDate,
    checkboxValues,
    checkboxGroups,
  ]);
};
