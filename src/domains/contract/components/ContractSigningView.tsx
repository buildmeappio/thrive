"use client";

import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { signContract } from "../server/actions/signContract.actions";
import { signContractByExaminer } from "../server/actions/signContractByExaminer";
import { declineContractByExaminer } from "../server/actions/declineContractByExaminer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

  // Generate PDF from HTML contract
  const generatePdfFromHtml = async (): Promise<string> => {
    const contractElement = document.getElementById("contract");
    if (!contractElement) {
      throw new Error("Contract element not found");
    }

    try {
      // Store original scroll position and styles
      const originalScrollTop = contractElement.scrollTop;
      const originalOverflow = contractElement.style.overflow;
      const originalHeight = contractElement.style.height;
      const originalMaxHeight = contractElement.style.maxHeight;

      // Temporarily adjust styles to capture full content
      contractElement.style.overflow = "visible";
      contractElement.style.height = "auto";
      contractElement.style.maxHeight = "none";

      // Scroll to top to ensure we capture from the beginning
      contractElement.scrollTop = 0;

      // Wait a bit for rendering
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Use html2canvas to capture the FULL contract as an image
      // Using scale: 1.5 for balance between quality and file size
      // This should keep PDF under 25MB limit while maintaining readability
      const canvas = await html2canvas(contractElement, {
        scale: 1.5, // Reduced from 2 to keep file size manageable
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        removeContainer: false,
        // Ensure we capture the full height
        height: contractElement.scrollHeight,
        width: contractElement.scrollWidth,
      });

      // Restore original styles
      contractElement.style.overflow = originalOverflow;
      contractElement.style.height = originalHeight;
      contractElement.style.maxHeight = originalMaxHeight;
      contractElement.scrollTop = originalScrollTop;

      // PDF dimensions (A4 size in mm)
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10; // Margin in mm
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = pdfHeight - margin * 2;

      // Calculate image dimensions to fit PDF width while maintaining aspect ratio
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Helper function to find safe break points (horizontal gaps/white space)
      const findSafeBreakPoint = (
        startY: number,
        endY: number,
        canvas: HTMLCanvasElement,
      ): number => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return endY;

        const imageData = ctx.getImageData(
          0,
          startY,
          canvas.width,
          endY - startY,
        );
        const data = imageData.data;
        const threshold = 245; // Consider pixels lighter than this as "white"
        const minGapHeight = 20; // Minimum gap height to consider as a break point (in pixels)
        const whitePixelRatio = 0.85; // At least 85% of pixels should be white

        let bestBreakY = endY;
        let gapStart = -1;
        let bestGapHeight = 0;
        let bestGapY = endY;

        // Scan from bottom to top (near the end) to find gaps
        const searchHeight = endY - startY;
        for (let y = searchHeight - 1; y >= minGapHeight; y--) {
          let whiteCount = 0;

          // Sample pixels across the width (check every 5th pixel for performance)
          const sampleStep = 5;
          for (let x = 0; x < canvas.width; x += sampleStep) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r + g + b) / 3;

            if (brightness >= threshold) {
              whiteCount++;
            }
          }

          const whiteRatio = whiteCount / (canvas.width / sampleStep);
          const isGapRow = whiteRatio >= whitePixelRatio;

          if (isGapRow) {
            if (gapStart === -1) {
              gapStart = y;
            }
            const gapHeight = gapStart - y + 1;

            // Track the best gap (largest and closest to end)
            if (gapHeight >= minGapHeight) {
              const gapY = startY + y;
              // Prefer gaps closer to the end, but prioritize larger gaps
              if (
                gapHeight > bestGapHeight ||
                (gapHeight === bestGapHeight && gapY > bestGapY)
              ) {
                bestGapHeight = gapHeight;
                bestGapY = gapY;
                // Use the start of the gap as break point (top of the gap)
                bestBreakY = gapY;
              }
            }
          } else {
            // Reset gap tracking when we hit non-gap content
            gapStart = -1;
          }
        }

        return bestBreakY;
      };

      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate page height in pixels
      const pageHeightInPixels = contentHeight * (canvas.height / imgHeight);

      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / contentHeight);

      console.log(
        `Generating PDF: ${totalPages} pages, image height: ${imgHeight}mm, content height per page: ${contentHeight}mm`,
      );

      // Add content to PDF, splitting across pages at safe break points
      let currentY = 0;
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the ideal end position for this page
        const idealEndY = Math.min(
          currentY + pageHeightInPixels,
          canvas.height,
        );

        // Find a safe break point near the ideal end position
        // Look for break points within the last 30% of the page (but at least 100px from start)
        const searchStartY = Math.max(
          currentY + 100, // Ensure we have some content before looking for breaks
          idealEndY - pageHeightInPixels * 0.3,
        );
        const safeBreakY = findSafeBreakPoint(searchStartY, idealEndY, canvas);

        // Use the safe break point if it's reasonable (not too close to start, not too far from ideal)
        const sourceY = currentY;
        const minHeight = pageHeightInPixels * 0.7; // At least 70% of page height
        const maxHeight = pageHeightInPixels * 1.1; // At most 110% of page height

        let actualEndY = idealEndY;
        if (
          safeBreakY < idealEndY &&
          safeBreakY > currentY + minHeight &&
          safeBreakY <= currentY + maxHeight
        ) {
          actualEndY = safeBreakY;
        }

        // For last page, use remaining content
        if (page === totalPages - 1) {
          actualEndY = canvas.height;
        }

        const actualSourceHeight = actualEndY - sourceY;

        // Ensure we have at least some content
        if (actualSourceHeight < 50 && page < totalPages - 1) {
          // If the safe break is too close to start, use ideal end
          const fallbackEndY = Math.min(
            currentY + pageHeightInPixels,
            canvas.height,
          );
          const fallbackHeight = fallbackEndY - sourceY;

          // Create a temporary canvas for this page's portion
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = fallbackHeight;
          const pageCtx = pageCanvas.getContext("2d");

          if (!pageCtx) {
            throw new Error("Failed to get canvas context");
          }

          // Fill with white background first
          pageCtx.fillStyle = "#ffffff";
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          // Draw the portion of the original canvas for this page
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            fallbackHeight,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height,
          );

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);
          const pageImgHeight = (fallbackHeight * imgWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            "JPEG",
            margin,
            margin,
            imgWidth,
            pageImgHeight,
          );

          currentY = fallbackEndY;
          continue;
        }

        // Create a temporary canvas for this page's portion
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = actualSourceHeight;
        const pageCtx = pageCanvas.getContext("2d");

        if (!pageCtx) {
          throw new Error("Failed to get canvas context");
        }

        // Fill with white background first
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw the portion of the original canvas for this page
        pageCtx.drawImage(
          canvas,
          0,
          sourceY, // Source x, y (start from top of this page's portion)
          canvas.width,
          actualSourceHeight, // Source width, height
          0,
          0, // Destination x, y
          pageCanvas.width,
          pageCanvas.height, // Destination width, height
        );

        // Convert page canvas to image with compression
        // Using 0.92 quality for JPEG to reduce file size while maintaining readability
        // JPEG is better for text documents than PNG for file size
        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);

        // Calculate the height this page's image should be in mm
        const pageImgHeight = (actualSourceHeight * imgWidth) / canvas.width;

        // Add this page's image to PDF
        pdf.addImage(
          pageImgData,
          "JPEG",
          margin,
          margin,
          imgWidth,
          pageImgHeight,
        );

        // Update currentY for next page
        currentY = actualEndY;
      }

      // Convert PDF to base64
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // Check file size (Gmail limit is 25MB)
      const pdfSizeBytes = (pdfBase64.length * 3) / 4; // Approximate size in bytes
      const pdfSizeMB = pdfSizeBytes / (1024 * 1024);

      console.log(
        `PDF generated: ${pdfSizeMB.toFixed(2)} MB, ${totalPages} pages`,
      );

      if (pdfSizeMB > 24) {
        console.warn(
          `⚠️ PDF size (${pdfSizeMB.toFixed(2)} MB) is close to Gmail's 25MB limit`,
        );
      }

      return pdfBase64;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF from contract");
    }
  };

  const handleSign = async () => {
    if (isSigning) return;
    setIsSigning(true);

    try {
      const contractElement = document.getElementById("contract");
      const htmlContent = contractElement?.innerHTML || contractHtml;
      const userAgent = navigator.userAgent;

      // Generate PDF from the signed HTML contract
      const pdfBase64 = await generatePdfFromHtml();

      // 1. Sign the contract (stores signature and updates status)
      const result = await signContract(
        contractId,
        sigName,
        htmlContent,
        pdfBase64,
        undefined,
        userAgent,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to sign contract");
      }

      // 2. Notify admin that contract is signed and send signed contract to examiner
      try {
        // Pass base64 PDF string - server will convert to Buffer
        await signContractByExaminer(
          examinerProfileId,
          examinerEmail,
          contractId,
          pdfBase64, // Pass base64 string, server will convert to Buffer
        );
      } catch (notificationError) {
        console.warn("Failed to send notification emails:", notificationError);
        // Continue anyway - signature was successful
      }

      toast.success("Contract signed successfully!", {
        position: "top-right",
      });
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
        declineReason,
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
      canvas.removeEventListener("touchstart", start as EventListener);
      canvas.removeEventListener("touchmove", move as EventListener);
      window.removeEventListener("touchend", end);
    };
  }, []);

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

      const walker = document.createTreeWalker(
        contractEl,
        NodeFilter.SHOW_TEXT,
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
      // Final fallback: append to contract root once (should rarely happen)
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
        const dateInput = dateField.querySelector<HTMLElement>(
          "input, span, div, p",
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
            (node) => node.nodeType === Node.TEXT_NODE,
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
      <div className="bg-[#F4FBFF] min-h-[calc(100vh-80px)] overflow-hidden p-4 flex items-center justify-center">
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
              You have declined the contract. The admin team has been notified
              of your decision.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success page after signing
  if (signed) {
    return (
      <div className="bg-[#F4FBFF] min-h-[calc(100vh-80px)] overflow-hidden p-4 flex items-center justify-center">
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
              Thank you for signing the agreement. Your contract has been
              submitted and is now awaiting admin review and confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4FBFF] min-h-screen overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0 w-full">
          {/* LEFT: Contract */}
          <div
            id="contract"
            className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-white rounded-[20px]"
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
            className="w-full lg:w-96 lg:min-w-[384px] bg-white p-6 md:p-8 rounded-[20px] flex flex-col shrink-0"
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
                    background:
                      isDeclining || !declineReason.trim()
                        ? "#9CA3AF"
                        : "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
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
