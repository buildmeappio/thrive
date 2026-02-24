import { useRef, useEffect, useState, useCallback } from 'react';

export const useAdminSignatureCanvas = () => {
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
      ctxRef.current.strokeStyle = '#000000';
      ctxRef.current.lineWidth = 2;
      ctxRef.current.lineCap = 'round';
      ctxRef.current.lineJoin = 'round';
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

    // Use capture phase to ensure events are caught before modal handlers
    canvas.addEventListener('mousedown', start, true);
    canvas.addEventListener('mousemove', move, true);
    canvas.addEventListener('mouseleave', end, true);
    window.addEventListener('mouseup', end, true);
    canvas.addEventListener(
      'touchstart',
      e => {
        e.preventDefault();
        e.stopPropagation();
        start(e);
      },
      true
    );
    canvas.addEventListener(
      'touchmove',
      e => {
        e.preventDefault();
        e.stopPropagation();
        move(e);
      },
      true
    );
    window.addEventListener('touchend', end, true);

    // Prevent context menu on right click
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    canvas.addEventListener('contextmenu', preventContextMenu, true);

    return () => {
      canvas.removeEventListener('mousedown', start, true);
      canvas.removeEventListener('mousemove', move, true);
      canvas.removeEventListener('mouseleave', end, true);
      window.removeEventListener('mouseup', end, true);
      canvas.removeEventListener('touchstart', start as EventListener, true);
      canvas.removeEventListener('touchmove', move as EventListener, true);
      window.removeEventListener('touchend', end, true);
      canvas.removeEventListener('contextmenu', preventContextMenu, true);
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
