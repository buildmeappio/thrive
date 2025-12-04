"use client";

import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { signContract } from "../server/actions/signContract.actions";
import { signContractByExaminer } from "../server/actions/signContractByExaminer";
import { declineContractByExaminer } from "../server/actions/declineContractByExaminer";

interface ContractSigningViewProps {
  token: string;
  contractId: string;
  examinerProfileId: string;
  examinerEmail: string;
  examinerName: string;
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    cancellationFee: number;
    effectiveDate?: string;
  };
  contractHtml: string;
  isAlreadySigned: boolean;
}

const ContractSigningView = ({
  token: _token,
  contractId,
  examinerProfileId,
  examinerEmail,
  examinerName,
  feeStructure,
  contractHtml,
  isAlreadySigned,
}: ContractSigningViewProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [sigName, _setSigName] = useState(examinerName);
  const [sigDate, _setSigDate] = useState(feeStructure.effectiveDate || today);
  const [agree, setAgree] = useState(false);
  const [signed, setSigned] = useState(isAlreadySigned); // Initialize with isAlreadySigned
  const [declined, setDeclined] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const handleSign = async () => {
    if (isSigning) return;
    setIsSigning(true);

    try {
      const contractElement = document.getElementById("contract");
      const htmlContent = contractElement?.innerHTML || contractHtml;
      const pdfBase64 = signatureImage?.split(",")[1] || "";
      const userAgent = navigator.userAgent;

      // 1. Sign the contract (stores signature and updates status)
      const result = await signContract(
        contractId,
        sigName,
        htmlContent,
        pdfBase64,
        undefined,
        userAgent
      );

      if (!result.success) {
        throw new Error("Failed to sign contract");
      }

      // 2. Notify admin that contract is signed (don't fail if notification fails)
      try {
        await signContractByExaminer(examinerProfileId, examinerEmail);
      } catch (notificationError) {
        console.warn("Failed to send admin notification:", notificationError);
        // Continue anyway - signature was successful
      }

      toast.success("Contract signed successfully!");
      setSigned(true);
      // Don't redirect - show success message on same page
    } catch (error) {
      console.error("Error signing contract:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign contract";
      toast.error(errorMessage);
    } finally {
      setIsSigning(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    if (isDeclining) return;
    setIsDeclining(true);

    try {
      const result = await declineContractByExaminer(
        examinerProfileId,
        examinerEmail,
        declineReason
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to decline contract");
      }

      toast.success("Contract declined successfully");
      setDeclined(true);
      setShowDeclineModal(false);
    } catch (error) {
      console.error("Error declining agreement:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline agreement";
      toast.error(errorMessage);
    } finally {
      setIsDeclining(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      return { x, y };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      drawingRef.current = true;
      lastRef.current = getPos(e);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawingRef.current || !ctxRef.current || !lastRef.current) return;
      const p = getPos(e);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(lastRef.current.x, lastRef.current.y);
      ctxRef.current.lineTo(p.x, p.y);
      ctxRef.current.lineWidth = 2;
      ctxRef.current.lineCap = "round";
      ctxRef.current.stroke();
      lastRef.current = p;
    };

    const end = () => {
      drawingRef.current = false;
      lastRef.current = null;
      if (canvas) setSignatureImage(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      start(e);
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      move(e);
    });
    window.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start as any);
      canvas.removeEventListener("touchmove", move as any);
      window.removeEventListener("touchend", end);
    };
  }, []);

  useEffect(() => {
    const contractEl = document.getElementById("contract");
    if (!contractEl) return;

    const updateTargets = (
      selectors: string[],
      updater: (el: HTMLElement) => void
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
        NodeFilter.SHOW_TEXT
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

      const walker = document.createTreeWalker(
        contractEl,
        NodeFilter.SHOW_TEXT
      );

      let foundExaminerSignature = false;
      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
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
        "#contract-dynamic-examiner-signature"
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
      }
    );

    const dynamicContainer = hasImageTarget ? null : ensureDynamicContainer();

    if (dynamicContainer) {
      if (signatureImage) {
        dynamicContainer.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
      } else {
        dynamicContainer.innerHTML = "";
      }
    } else if (!hasImageTarget && signatureImage) {
      // Final fallback: append to contract root once (should rarely happen)
      let fallback = contractEl.querySelector<HTMLElement>(
        "#contract-dynamic-examiner-signature"
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
        "#contract-dynamic-examiner-signature"
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
        const dateInput = dateField.querySelector<HTMLElement>(
          "input, span, div, p"
        );
        if (dateInput) {
          const inputText = dateInput.textContent || "";
          if (!inputText.includes(formattedDate)) {
            if (normalized(inputText).includes("date")) {
              dateInput.textContent = inputText.trim().endsWith(":")
                ? `${inputText.trim()} ${formattedDate}`
                : `${inputText.trim()}: ${formattedDate}`;
            } else {
              dateInput.textContent = inputText.trim()
                ? `${inputText.trim()} ${formattedDate}`
                : formattedDate;
            }
          }
        } else {
          const textNodes = Array.from(dateField.childNodes).filter(
            (node) => node.nodeType === Node.TEXT_NODE
          );
          if (textNodes.length > 0) {
            const textNode = textNodes[0] as Text;
            const nodeText = textNode.textContent || "";
            if (!nodeText.includes(formattedDate)) {
              if (normalized(nodeText).includes("date")) {
                textNode.textContent = nodeText.trim().endsWith(":")
                  ? `${nodeText.trim()} ${formattedDate}`
                  : `${nodeText.trim()}: ${formattedDate}`;
              } else {
                textNode.textContent = nodeText.trim()
                  ? `${nodeText.trim()} ${formattedDate}`
                  : formattedDate;
              }
            }
          } else {
            if (!currentText.includes(formattedDate)) {
              dateField.textContent = currentText.trim().endsWith(":")
                ? `${currentText.trim()} ${formattedDate}`
                : currentText.trim()
                ? `${currentText.trim()}: ${formattedDate}`
                : `Date: ${formattedDate}`;
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
      }
    );

    updateTargets(
      [
        '[data-contract-signature="date"]',
        "#examiner-signature-date",
        ".examiner-signature-date",
      ],
      (el) => {
        el.textContent = formattedDate;
      }
    );
  }, [
    contractHtml,
    signatureImage,
    sigName,
    sigDate,
    agree,
    isSigning,
    signed,
  ]);

  // Show declined page
  if (declined) {
    return (
      <div className="bg-[#F4FBFF] h-screen overflow-hidden p-4 pt-8 flex items-start justify-center">
        {/* Declined Content */}
        <div className="max-w-2xl w-full">
          <div
            className="bg-white rounded-[20px] p-8 md:p-12 text-center"
            style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
          >
            {/* Declined Icon */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold text-[#140047] mb-4">
              Contract Declined
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-600">
              You have declined the contract. The admin team has been notified of your decision.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success page after signing
  if (signed) {
    return (
      <div className="bg-[#F4FBFF] h-screen overflow-hidden p-4 pt-8 flex items-start justify-center">
        {/* Success Content */}
        <div className="max-w-2xl w-full">
          <div
            className="bg-white rounded-[20px] p-8 md:p-12 text-center"
            style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
          >
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold text-[#140047] mb-4">
              Contract Signed Successfully!
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-600">
              Thank you for signing the agreement. Your contract has been submitted and is now awaiting admin review and confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4FBFF] min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* LEFT: Contract */}
          <div
            id="contract"
            className="flex-1 overflow-y-auto overflow-x-hidden bg-white rounded-[20px]"
            style={{
              fontFamily: "Arial, sans-serif",
              padding: "40px 50px",
              maxWidth: "210mm",
              lineHeight: "1.4",
              boxShadow: "0px 0px 36.35px 0px #00000008",
              height: "calc(100vh - 100px)",
            }}
          >
            <div
              id="contract-content"
              dangerouslySetInnerHTML={{
                __html:
                  contractHtml || "<div>Sample Contract Content Here</div>",
              }}
            />
          </div>

          {/* RIGHT: Signature Panel */}
          <div
            className="w-full lg:w-96 bg-white p-6 md:p-8 rounded-[20px] flex flex-col shrink-0"
            style={{
              boxShadow: "0px 0px 36.35px 0px #00000008",
            }}
          >
            <div className="border-b-2 border-[#00A8FF] pb-3 mb-6">
              <h2 className="text-2xl md:text-[24px] font-semibold text-black">
                Sign Agreement
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Full Name
                </label>
                <input
                  disabled
                  type="text"
                  value={sigName}
                  placeholder="Dr. Jane Doe"
                  className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={sigDate}
                  disabled
                  className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Draw Your Signature
                </label>
                <div className="border-2 border-[#00A8FF] rounded-[10px] p-1 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={140}
                    className="w-full cursor-crosshair bg-[#F2F5F6] rounded-[8px]"
                    style={{ touchAction: "none" }}
                  />
                </div>
                <button
                  onClick={clearSignature}
                  className="mt-2 text-sm text-[#00A8FF] hover:text-[#0088CC] font-semibold underline transition-colors"
                >
                  Clear Signature
                </button>
              </div>

              <div className="border-2 border-[#E9EDEE] rounded-[10px] p-4 bg-[#F2F5F6]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-[#00A8FF] border-2 border-[#9EA9AA] rounded focus:ring-2 focus:ring-[#00A8FF]/30 focus-visible:outline-none cursor-pointer"
                  />
                  <span className="text-xs text-[#333] leading-relaxed font-medium">
                    I agree that this electronic signature is the legal
                    equivalent of my handwritten signature and I accept all
                    terms and conditions of this agreement.
                  </span>
                </label>
              </div>

              <button
                onClick={handleSign}
                disabled={
                  !agree || !sigName || !sigDate || !signatureImage || isSigning
                }
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-base transition-all ${
                  agree && sigName && sigDate && signatureImage && !isSigning
                    ? "cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                style={
                  agree && sigName && sigDate && signatureImage && !isSigning
                    ? {
                        background:
                          "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
                      }
                    : {}
                }
              >
                {isSigning ? "Processing..." : "Sign Agreement"}
              </button>

              {/* Decline Button */}
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={isSigning}
                className="w-full py-3 px-4 rounded-lg font-semibold text-red-600 text-base transition-all border-2 border-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline Agreement
              </button>
            </div>
          </div>
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
            <div 
              className="bg-white rounded-[20px] p-8 max-w-md w-full"
              style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
            >
              {/* Modal Header with border */}
              <div className="border-b-2 border-[#00A8FF] pb-3 mb-6">
                <h3 className="text-2xl font-semibold text-[#140047]">
                  Decline Agreement
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for declining this agreement:
              </p>
              
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full h-32 p-3 border-2 border-gray-200 rounded-[10px] focus:ring-2 focus:ring-[#00A8FF]/30 focus:border-[#00A8FF] resize-none text-sm"
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason("");
                  }}
                  disabled={isDeclining}
                  className="flex-1 py-3 px-4 rounded-[10px] font-semibold text-[#00A8FF] border-2 border-[#00A8FF] bg-white hover:bg-[#F7FCFF] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isDeclining || !declineReason.trim()}
                  className="flex-1 py-3 px-4 rounded-[10px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isDeclining || !declineReason.trim() 
                      ? "#9CA3AF" 
                      : "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)"
                  }}
                >
                  {isDeclining ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractSigningView;
