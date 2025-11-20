"use client";

import { useRef, useState, useEffect } from "react";
import { useReportStore } from "../state/useReportStore";
import { X } from "lucide-react";

export default function SignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { signature, setSignature, clearSignature } = useReportStore();

  // Restore signature from store when component mounts or signature changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If there's a signature in the store, restore it to the canvas
    if (signature?.data) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = signature.data;
    }
  }, [signature]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        setSignature({ type: "canvas", data: dataUrl });
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearSignature();
  };

  return (
    <div>
      <label className="block text-sm font-normal text-black mb-2 font-poppins">
        Signature
      </label>
      <div>
        <canvas
          ref={canvasRef}
          width={450}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border border-gray-300 rounded-lg bg-[#F5F5F5] cursor-crosshair"
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors font-poppins"
            title="Clear signature">
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
