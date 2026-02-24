import { useRef, useEffect, useState, useCallback } from 'react';

export const useSignatureCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
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
      ctxRef.current.lineCap = 'round';
      ctxRef.current.stroke();
      lastRef.current = p;
    };

    const end = () => {
      drawingRef.current = false;
      lastRef.current = null;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let hasDrawing = false;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a > 0 && (r < 250 || g < 250 || b < 250)) {
              hasDrawing = true;
              break;
            }
          }

          if (hasDrawing) {
            setSignatureImage(canvas.toDataURL('image/png'));
          } else {
            setSignatureImage(null);
          }
        }
      }
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      start(e);
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      move(e);
    });
    window.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start as EventListener);
      canvas.removeEventListener('touchmove', move as EventListener);
      window.removeEventListener('touchend', end);
    };
  }, []);

  const validateSignature = useCallback((): boolean => {
    if (!signatureImage) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 0 && (r < 250 || g < 250 || b < 250)) {
        return true;
      }
    }

    return false;
  }, [signatureImage]);

  return {
    canvasRef,
    signatureImage,
    clearSignature,
    validateSignature,
  };
};
