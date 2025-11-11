"use client";

import { useRef, useEffect, useState } from "react";
import { signContract } from "../server/actions/signContract.actions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ContractSigningViewProps {
  token: string;
  contractId: string;
  examinerName: string;
  feeStructure: {
    standardIMEFee: number;
    virtualIMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    reportTurnaroundDays: number;
    cancellationFee: number;
    effectiveDate?: string;
  };
}

const ContractSigningView = ({
  token,
  contractId,
  examinerName,
  feeStructure,
}: ContractSigningViewProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [sigName, setSigName] = useState(examinerName);
  const [sigDate, setSigDate] = useState(feeStructure.effectiveDate || today);
  const [agree, setAgree] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const router = useRouter();

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
      if (!contractElement) {
        toast.error("Contract not found!");
        return;
      }

      // Convert contract HTML to canvas
      const canvas = await html2canvas(contractElement);
      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Convert PDF to base64
      const pdfBase64 = pdf.output("dataurlstring").split(",")[1];

      // Call server action with PDF and HTML
      const res = await signContract(
        contractId,
        sigName,
        contractElement.outerHTML,
        pdfBase64,
        window.location.hostname,
        navigator.userAgent
      );

      if (res.success) {
        toast.success("Contract signed and uploaded to S3!");
        setSigned(true);
        router.push(`/create-account?token=${token}`);
      } else {
        toast.error("Error: " + res.error);
      }
    } catch (error: any) {
      toast.error("Error signing contract: " + error.message);
    } finally {
      setIsSigning(false);
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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: '"Inter", sans-serif',
        background: "#f0f2f5",
      }}
    >
      {/* LEFT: Contract */}
      <div
        id="contract"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 32px",
          background: "#fff",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
          borderRadius: "8px 0 0 8px",
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          EXAMINER AGREEMENT
        </h1>
        <p style={{ fontSize: 14, color: "#4b5563" }}>
          <strong>Effective Date:</strong>{" "}
          {new Date(sigDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p style={{ fontSize: 14, color: "#374151", marginBottom: 20 }}>
          This Agreement is made between <strong>Thrive IME Platform</strong>{" "}
          (&quot;Platform&quot;) and Dr. <strong>{sigName}</strong>{" "}
          (&quot;Examiner&quot;) located in British Columbia, Canada.
        </p>

        <hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />

        {/* Contract Sections */}
        {[
          {
            title: "1. PURPOSE",
            content:
              "This Agreement outlines the terms under which the Examiner will provide Independent Medical Examination (IME) services through the Platform to claimants referred by insurance companies, legal firms, and other authorized organizations.",
          },
          { title: "2. FEE STRUCTURE", content: null },
          {
            title: "3. SERVICES TO BE PROVIDED",
            content: (
              <ul>
                <li>
                  Conduct thorough and impartial medical examinations of
                  claimants
                </li>
                <li>
                  Prepare detailed, objective medical reports within the agreed
                  turnaround time
                </li>
                <li>
                  Maintain professional standards in accordance with medical
                  licensing requirements
                </li>
                <li>Be available for testimony or clarification if required</li>
                <li>Respond to case assignments in a timely manner</li>
              </ul>
            ),
          },
          {
            title: "4. PROFESSIONAL OBLIGATIONS",
            content: (
              <ul>
                <li>
                  Maintain current medical licensure and malpractice insurance
                </li>
                <li>
                  Comply with all applicable laws, regulations, and ethical
                  guidelines
                </li>
                <li>
                  Provide services in a professional, objective, and unbiased
                  manner
                </li>
                <li>
                  Keep the Platform informed of any changes to availability or
                  credentials
                </li>
                <li>
                  Maintain patient confidentiality in accordance with applicable
                  privacy laws
                </li>
              </ul>
            ),
          },
          {
            title: "5. CONFIDENTIALITY",
            content: (
              <ul>
                <li>
                  Not disclose any patient information except as required by law
                  or authorized by the patient
                </li>
                <li>
                  Maintain secure storage of all patient records and examination
                  materials
                </li>
                <li>
                  Comply with all applicable privacy legislation including but
                  not limited to PIPEDA
                </li>
                <li>
                  Return or destroy all confidential materials upon completion
                  of services
                </li>
              </ul>
            ),
          },
          {
            title: "6. INDEPENDENT CONTRACTOR STATUS",
            content: (
              <ul>
                <li>All applicable taxes and business registrations</li>
                <li>Professional liability insurance</li>
                <li>
                  Business expenses including office space, equipment, and
                  supplies
                </li>
                <li>Compliance with all professional licensing requirements</li>
              </ul>
            ),
          },
          {
            title: "7. TERM AND TERMINATION",
            content:
              "This Agreement shall remain in effect until terminated by either party with 30 days written notice. The Platform may terminate immediately if the Examiner breaches any material term, loses licensure or insurance, engages in misconduct, or fails to maintain quality standards.",
          },
          {
            title: "8. LIABILITY AND INDEMNIFICATION",
            content:
              "The Examiner agrees to maintain professional liability insurance with minimum coverage of $2,000,000 and shall indemnify the Platform against any claims arising from professional services or negligence.",
          },
          {
            title: "9. DISPUTE RESOLUTION",
            content:
              "Disputes shall be resolved through mediation, and if necessary, arbitration under the laws of British Columbia.",
          },
          {
            title: "10. GENERAL PROVISIONS",
            content: (
              <ul>
                <li>
                  This Agreement constitutes the entire agreement between the
                  parties
                </li>
                <li>
                  Any amendments must be in writing and signed by both parties
                </li>
                <li>
                  This Agreement shall be governed by the laws of British
                  Columbia
                </li>
                <li>
                  If any provision is invalid, the remaining provisions shall
                  continue in effect
                </li>
              </ul>
            ),
          },
          {
            title: "ACKNOWLEDGMENT",
            content:
              "By accepting cases through the Thrive IME Platform, the Examiner acknowledges that they have read, understood, and agree to be bound by the terms and conditions of this Agreement.",
          },
        ].map((section, idx) => (
          <div key={idx} style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 8,
                color: "#1f2937",
              }}
            >
              {section.title}
            </h2>
            {section.content && (
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                {section.content}
              </div>
            )}
            {section.title === "2. FEE STRUCTURE" && (
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  marginTop: 12,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #d1d5db",
                        padding: 8,
                        textAlign: "left",
                        background: "#f9fafb",
                      }}
                    >
                      Service Type
                    </th>
                    <th
                      style={{
                        border: "1px solid #d1d5db",
                        padding: 8,
                        textAlign: "left",
                        background: "#f9fafb",
                      }}
                    >
                      Fee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Standard IME (in-clinic)
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      ${feeStructure.standardIMEFee.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Virtual / Tele-IME
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      ${feeStructure.virtualIMEFee.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Record Review Only
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      ${feeStructure.recordReviewFee.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Hourly Rate (if applicable)
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      ${feeStructure.hourlyRate.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Report Turnaround
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      {feeStructure.reportTurnaroundDays} business days
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      Cancellation / No-show Fee
                    </td>
                    <td style={{ border: "1px solid #d1d5db", padding: 8 }}>
                      ${feeStructure.cancellationFee.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        ))}

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Examiner Signature:
        </h2>
        <div
          style={{
            height: 80,
            borderBottom: "1px solid #000",
            marginBottom: 4,
          }}
        >
          {signatureImage && (
            <img
              src={signatureImage}
              alt="Signature"
              style={{ height: "100%" }}
            />
          )}
        </div>
        <p style={{ fontSize: 14, color: "#374151" }}>Date: {sigDate}</p>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
          For Platform:
        </h2>
        <p style={{ fontSize: 14, color: "#374151" }}>Authorized Signatory</p>
        <p style={{ fontSize: 14, color: "#374151" }}>Date: ________________</p>

        <p style={{ marginTop: 32, fontSize: 12, color: "#6b7280" }}>
          © 2025 Thrive Assessment & Care. All rights reserved.
        </p>
      </div>

      {/* RIGHT: Signature Panel */}
      <div
        style={{
          width: 400,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          background: "#f9fafb",
          borderLeft: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1f2937" }}>
          Signature Panel
        </h2>

        <label style={{ fontWeight: 500, color: "#374151" }}>Full Name</label>
        <input
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          placeholder="e.g., Dr. Jane Doe"
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            width: "100%",
          }}
        />

        <label style={{ fontWeight: 500, color: "#374151" }}>Date</label>
        <input
          type="date"
          value={sigDate}
          onChange={(e) => setSigDate(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            width: "100%",
          }}
        />

        <label style={{ fontWeight: 500, color: "#374151" }}>
          Draw Signature
        </label>
        <canvas
          ref={canvasRef}
          width={360}
          height={160}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 6,
            touchAction: "none",
          }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={clearSignature}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #9ca3af",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Clear
          </button>
          <button
            onClick={handleSign}
            disabled={!agree || !sigName || !sigDate || isSigning}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 6,
              background:
                agree && sigName && sigDate && !isSigning
                  ? "#2563eb"
                  : "#9ca3af",
              color: "#fff",
              border: "none",
              cursor:
                agree && sigName && sigDate && !isSigning
                  ? "pointer"
                  : "not-allowed",
              fontWeight: 500,
            }}
          >
            {isSigning ? "Signing..." : "Adopt & Sign"}
          </button>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#374151",
          }}
        >
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree this electronic signature is the legal equivalent of my
          handwritten signature.
        </label>

        <span
          style={{
            fontWeight: 600,
            color: signed ? "#166534" : "#6b7280",
            fontSize: 14,
          }}
        >
          {signed ? "Signed" : "Awaiting signature"}
        </span>
      </div>
    </div>
  );
};

export default ContractSigningView;
