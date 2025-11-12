"use client";

import { useRef, useEffect, useState } from "react";

interface ContractSigningViewProps {
  token: string;
  contractId: string;
  examinerName: string;
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
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

    // Simulate signing process
    setTimeout(() => {
      alert("Contract signed successfully!");
      setSigned(true);
      setIsSigning(false);
    }, 1000);
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
    <div className="flex justify-center h-screen bg-gray-100">
      {/* LEFT: Contract */}
      <div
        id="contract"
        className="flex-1 overflow-y-auto bg-white shadow-lg"
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "40px 50px",
          maxWidth: "210mm",
          lineHeight: "1.4",
        }}
      >
        {/* Header with Blue Border */}
        <div className="border-b-4 border-b-[#00A8FF] p-2 mb-6">
          <h1
            className="text-center text-xl font-bold mb-1"
            style={{ color: "#000" }}
          >
            INDEPENDENT MEDICAL EXAMINER
          </h1>
          <h1
            className="text-center text-xl font-bold mb-3"
            style={{ color: "#000" }}
          >
            AGREEMENT
          </h1>
        </div>

        <div className="bg-[#E8F0F2] rounded-md mb-4 px-6 py-4">
          <p className="text-sm font-semibold mb-2" style={{ color: "#000" }}>
            Effective Date: {new Date(sigDate).toLocaleDateString("en-CA")}
          </p>

          <p className="text-sm" style={{ textAlign: "justify" }}>
            This Agreement is made between <strong>Thrive IME Platform</strong>{" "}
            (&quot;Platform&quot;) and Dr. <strong>{sigName}</strong> (&quot;Examiner&quot;) located
            in Manitoba.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            1. PURPOSE
          </h2>
          <p className="text-sm" style={{ textAlign: "justify" }}>
            This Agreement outlines the terms under which the Examiner will
            provide Independent Medical Examination (IME) services through the
            Platform to claimants referred by insurance companies, legal firms,
            and other authorized organizations.
          </p>
        </div>

        {/* Section 2 - Fee Structure */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            2. FEE STRUCTURE
          </h2>
          <p className="text-sm mb-2">
            The Examiner agrees to provide services at the following rates:
          </p>

          <table
            className="w-full mb-3"
            style={{ fontSize: "12px", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#2C3E50", color: "white" }}>
                <th className="border-2 border-[#2C3E50] px-3 py-2 text-left font-bold">
                  Service Type
                </th>
                <th className="border-2 border-[#2C3E50] px-3 py-2 text-left font-bold">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-1 border-gray-300 px-3 py-2">IME Fee</td>
                <td className="border-1 border-gray-300 px-3 py-2">
                  ${feeStructure.IMEFee.toFixed(2)}
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <td className="border-1 border-gray-300 px-3 py-2">
                  Record Review Fee
                </td>
                <td className="border-1 border-gray-300 px-3 py-2">
                  ${feeStructure.recordReviewFee.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border-1 border-gray-300 px-3 py-2">
                  Hourly Rate
                </td>
                <td className="border-1 border-gray-300 px-3 py-2">
                  ${feeStructure.hourlyRate.toFixed(2)}/hour
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <td className="border-1 border-gray-300 px-3 py-2">
                  Cancellation Fee
                </td>
                <td className="border-1 border-gray-300 px-3 py-2">
                  ${feeStructure.cancellationFee.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            3. SERVICES TO BE PROVIDED
          </h2>
          <p className="text-sm mb-2">The Examiner agrees to:</p>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>
              Conduct thorough and impartial medical examinations of claimants
            </li>
            <li>
              Maintain professional standards in accordance with medical
              licensing requirements
            </li>
            <li>Be available for testimony or clarification if required</li>
            <li>Respond to case assignments in a timely manner</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            4. PROFESSIONAL OBLIGATIONS
          </h2>
          <p className="text-sm mb-2">The Examiner shall:</p>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>
              Maintain current medical licensure and malpractice insurance
            </li>
            <li>
              Comply with all applicable laws, regulations, and ethical
              guidelines
            </li>
            <li>
              Provide services in a professional, objective, and unbiased manner
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
        </div>

        {/* Section 5 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            5. CONFIDENTIALITY
          </h2>
          <p className="text-sm mb-2">
            The Examiner acknowledges that all information obtained during
            examinations is confidential and shall:
          </p>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>
              Not disclose any patient information except as required by law or
              authorized by the patient
            </li>
            <li>
              Maintain secure storage of all patient records and examination
              materials
            </li>
            <li>
              Comply with all applicable privacy legislation including but not
              limited to PIPEDA
            </li>
            <li>
              Return or destroy all confidential materials upon completion of
              services
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            6. INDEPENDENT CONTRACTOR STATUS
          </h2>
          <p className="text-sm mb-2">
            The Examiner is an independent contractor and not an employee of the
            Platform. The Examiner is responsible for:
          </p>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>All applicable taxes and business registrations</li>
            <li>Professional liability insurance</li>
            <li>
              Business expenses including office space, equipment, and supplies
            </li>
            <li>Compliance with all professional licensing requirements</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            7. TERM AND TERMINATION
          </h2>
          <p className="text-sm mb-2">
            This Agreement shall remain in effect until terminated by either
            party with 30 days written notice. The Platform may terminate this
            Agreement immediately if the Examiner:
          </p>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>Breaches any material term of this Agreement</li>
            <li>Loses professional licensure or malpractice insurance</li>
            <li>Engages in professional misconduct</li>
            <li>Fails to maintain acceptable quality standards</li>
          </ul>
        </div>

        {/* Section 8 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            8. LIABILITY AND INDEMNIFICATION
          </h2>
          <p className="text-sm" style={{ textAlign: "justify" }}>
            The Examiner agrees to maintain professional liability insurance
            with minimum coverage of $2,000,000 and shall indemnify the Platform
            against any claims arising from the Examiner&apos;s professional services
            or negligence.
          </p>
        </div>

        {/* Section 9 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            9. DISPUTE RESOLUTION
          </h2>
          <p className="text-sm" style={{ textAlign: "justify" }}>
            Any disputes arising from this Agreement shall be resolved through
            mediation, and if necessary, arbitration in accordance with the laws
            of the Province of Manitoba.
          </p>
        </div>

        {/* Section 10 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2" >
            10. GENERAL PROVISIONS
          </h2>
          <ul
            className="text-sm ml-5 space-y-0"
            style={{ listStyleType: "disc" }}
          >
            <li>
              This Agreement constitutes the entire agreement between the
              parties
            </li>
            <li>
              Any amendments must be made in writing and signed by both parties
            </li>
            <li>This Agreement shall be governed by the laws of Manitoba</li>
            <li>
              If any provision is found invalid, the remaining provisions shall
              continue in effect
            </li>
          </ul>
        </div>

        {/* Acknowledgment */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2" >
            ACKNOWLEDGMENT
          </h2>
          <p className="text-sm" style={{ textAlign: "justify" }}>
            By accepting cases through the Thrive IME Platform, the Examiner
            acknowledges that they have read, understood, and agree to be bound
            by the terms and conditions of this Agreement.
          </p>
        </div>

        {/* Signature Area - No border or box */}
        <div className="mt-12 mb-12 space-y-4">
          <div>
            {signatureImage && (
            <div className="mb-1">
              <img src={signatureImage} alt="Signature" className="h-12" />
            </div>
          )}
          <div className="border-b-2 border-black w-80 mb-1"></div>
          Examiner&apos;s Signature
          </div>
        
        <div>
          <span className="font-semibold">Name:</span> {sigName}
        </div>
        <div>
          <span className="font-semibold">Date:</span> {sigDate}
        </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4">
          <p className="text-xs text-center" style={{ color: "#666" }}>
            © 2025 Thrive Assessment & Care. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT: Signature Panel */}
      <div className="w-96 bg-white border-l-2 border-blue-600 p-8 overflow-y-auto shadow-lg">
        <div className="border-b-2 border-blue-600 pb-3 mb-6">
          <h2 className="text-xl font-bold text-blue-900">Sign Agreement</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              placeholder="Dr. Jane Doe"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Effective Date
            </label>
            <input
              type="date"
              value={sigDate}
              disabled
              onChange={(e) => setSigDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Draw Your Signature
            </label>
            <div className="border-2 border-blue-600 rounded p-1 bg-white">
              <canvas
                ref={canvasRef}
                width={320}
                height={140}
                className="w-full cursor-crosshair bg-gray-50"
                style={{ touchAction: "none" }}
              />
            </div>
            <button
              onClick={clearSignature}
              className="mt-2 text-sm text-blue-700 hover:text-blue-900 font-semibold underline"
            >
              Clear Signature
            </button>
          </div>

          <div className="border-2 border-gray-300 rounded p-3 bg-blue-50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-5 h-5 text-blue-600 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-800 leading-relaxed font-medium">
                I agree that this electronic signature is the legal equivalent
                of my handwritten signature and I accept all terms and
                conditions of this agreement.
              </span>
            </label>
          </div>

          <button
            onClick={handleSign}
            disabled={
              !agree || !sigName || !sigDate || !signatureImage || isSigning
            }
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-base transition-all border-2 ${
              agree && sigName && sigDate && signatureImage && !isSigning
                ? "bg-blue-600 hover:bg-blue-700 border-blue-700 cursor-pointer shadow-md hover:shadow-lg"
                : "bg-gray-400 border-gray-400 cursor-not-allowed"
            }`}
          >
            {isSigning ? "Processing..." : "Sign Agreement"}
          </button>

          {signed && (
            <div className="p-4 bg-green-100 border-2 border-green-600 rounded-lg">
              <p className="text-sm text-green-900 font-bold text-center">
                ✓ Agreement Signed Successfully
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractSigningView;
