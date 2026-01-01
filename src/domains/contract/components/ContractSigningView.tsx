"use client";

import { useState, useCallback } from "react";
import { useSignatureCanvas } from "./hooks/useSignatureCanvas";
import { usePdfGeneration } from "./hooks/usePdfGeneration";
import { useCheckboxGroups } from "./hooks/useCheckboxGroups";
import { useContractSigning } from "./hooks/useContractSigning";
import { useContractDomUpdates } from "./hooks/useContractDomUpdates";
import { useCheckboxInteractions } from "./hooks/useCheckboxInteractions";
import { processContractHtmlWithHeadersFooters } from "./utils/contractHelpers";
import { ContractStyles } from "./styles/contractStyles";
import { DeclinedView } from "./components/DeclinedView";
import { SignedView } from "./components/SignedView";
import { SignaturePanel } from "./components/SignaturePanel";
import { DeclineModal } from "./components/DeclineModal";
import { ContractContent } from "./components/ContractContent";
import { ContractSigningViewProps } from "../types/contract.types";

const ContractSigningView = ({
  token: _token,
  contractId,
  examinerProfileId,
  examinerEmail,
  examinerName,
  feeStructure,
  contractHtml,
  isAlreadySigned,
  headerConfig,
  footerConfig,
  checkboxGroupsFromTemplate,
}: ContractSigningViewProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [sigName, _setSigName] = useState(examinerName);
  const [sigDate, _setSigDate] = useState(feeStructure.effectiveDate || today);
  const [agree, setAgree] = useState(false);

  // Process HTML with headers/footers first
  const processedHtml =
    headerConfig || footerConfig
      ? processContractHtmlWithHeadersFooters(
          contractHtml,
          headerConfig,
          footerConfig,
        )
      : contractHtml;

  // Hooks
  const { canvasRef, signatureImage, clearSignature, validateSignature } =
    useSignatureCanvas();
  const { generatePdfFromHtml } = usePdfGeneration();
  const { checkboxGroups, checkboxValues, setCheckboxValues } =
    useCheckboxGroups(processedHtml, checkboxGroupsFromTemplate);

  const {
    isSigning,
    isDeclining,
    signed,
    declined,
    showDeclineModal,
    declineReason,
    setShowDeclineModal,
    setDeclineReason,
    handleSign: handleSignInternal,
    handleDecline,
  } = useContractSigning({
    contractId,
    examinerProfileId,
    examinerEmail,
    sigName,
    sigDate,
    contractHtml,
    signatureImage,
    checkboxValues,
    generatePdfFromHtml,
  });

  // Handle signing with signature validation
  const handleSign = useCallback(async () => {
    if (!validateSignature()) {
      return;
    }
    await handleSignInternal();
  }, [validateSignature, handleSignInternal]);

  // Update DOM with signature, date, name, and checkboxes
  useContractDomUpdates({
    contractHtml: processedHtml,
    signatureImage,
    sigName,
    sigDate,
    checkboxValues,
    checkboxGroups,
  });

  // Handle checkbox interactions in contract preview
  useCheckboxInteractions({
    contractHtml: processedHtml,
    checkboxValues,
    checkboxGroups,
    setCheckboxValues,
  });

  // Handle checkbox changes from sidebar
  const handleCheckboxChange = useCallback(
    (groupKey: string, optionValue: string, checked: boolean) => {
      setCheckboxValues((prev) => {
        const currentValues = prev[groupKey] || [];
        const newValues = checked
          ? [...currentValues, optionValue]
          : currentValues.filter((v) => v !== optionValue);

        // Update visual checkboxes in contract preview
        setTimeout(() => {
          const contractContainer =
            document.getElementById("contract") ||
            document.getElementById("contract-content");
          if (!contractContainer) return;

          const group = checkboxGroups.find((g) => g.variableKey === groupKey);
          if (!group) return;

          group.options.forEach((opt) => {
            const isChecked = newValues.includes(opt.value);

            // Try data attributes first
            const indicators = contractContainer.querySelectorAll<HTMLElement>(
              `[data-variable-type="checkbox_group"][data-variable-key="${groupKey}"] .checkbox-indicator[data-checkbox-value="${opt.value}"]`,
            );

            if (indicators.length === 0) {
              // Fallback: search by label in <p> tags
              const allParagraphs =
                contractContainer.querySelectorAll<HTMLElement>("p");
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
                        p.appendChild(
                          document.createTextNode(" " + restOfText),
                        );
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
                  }
                }
              });
            } else {
              indicators.forEach((ind) => {
                ind.textContent = isChecked ? "☑" : "☐";
                ind.style.backgroundColor = isChecked
                  ? "#e3f2fd"
                  : "transparent";
              });
            }
          });
        }, 0);

        return {
          ...prev,
          [groupKey]: newValues,
        };
      });
    },
    [checkboxGroups, setCheckboxValues],
  );

  if (declined) {
    return <DeclinedView />;
  }

  if (signed || isAlreadySigned) {
    return <SignedView />;
  }

  return (
    <div className="bg-[#F4FBFF] min-h-screen overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0 w-full">
          <ContractContent processedHtml={processedHtml} />
          <SignaturePanel
            sigName={sigName}
            sigDate={sigDate}
            signatureImage={signatureImage}
            canvasRef={canvasRef}
            clearSignature={clearSignature}
            agree={agree}
            setAgree={setAgree}
            checkboxGroups={checkboxGroups}
            checkboxValues={checkboxValues}
            onCheckboxChange={handleCheckboxChange}
            onSign={handleSign}
            onDecline={() => setShowDeclineModal(true)}
            isSigning={isSigning}
          />
        </div>
      </div>

      <DeclineModal
        show={showDeclineModal}
        declineReason={declineReason}
        isDeclining={isDeclining}
        onReasonChange={setDeclineReason}
        onConfirm={handleDecline}
        onCancel={() => {
          setShowDeclineModal(false);
          setDeclineReason("");
        }}
      />

      <ContractStyles />
    </div>
  );
};

export default ContractSigningView;
