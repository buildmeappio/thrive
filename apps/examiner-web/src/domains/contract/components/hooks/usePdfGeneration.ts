import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper function to convert lab() colors to rgb()
const convertLabToRgb = (labColor: string): string => {
  try {
    const labMatch = labColor.match(/lab\(([^)]+)\)/i);
    if (!labMatch) return labColor;

    const values = labMatch[1]
      .split('/')
      .map(v => v.trim())
      .filter(Boolean);
    const labParts = values[0].split(/\s+/).map(parseFloat);
    const alpha = values[1] ? parseFloat(values[1]) : 1;

    if (labParts.length < 3 || isNaN(labParts[0])) {
      return alpha < 1 ? `rgba(0, 0, 0, ${alpha})` : 'rgb(0, 0, 0)';
    }

    const [L, a, b] = labParts;

    // Convert LAB to XYZ (D65 white point)
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const xr = fx > 0.206897 ? fx * fx * fx : (fx - 16 / 116) / 7.787;
    const yr = fy > 0.206897 ? fy * fy * fy : (fy - 16 / 116) / 7.787;
    const zr = fz > 0.206897 ? fz * fz * fz : (fz - 16 / 116) / 7.787;

    const x = xr * 0.95047;
    const y = yr * 1.0;
    const z = zr * 1.08883;

    // Convert XYZ to RGB (sRGB)
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let bl = x * 0.0557 + y * -0.204 + z * 1.057;

    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;

    // Clamp to 0-255
    r = Math.round(Math.max(0, Math.min(255, r * 255)));
    g = Math.round(Math.max(0, Math.min(255, g * 255)));
    bl = Math.round(Math.max(0, Math.min(255, bl * 255)));

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${bl})`;
  } catch (e) {
    console.warn('Failed to convert lab() color, using fallback:', e);
    return labColor.includes('rgba') || labColor.includes('alpha')
      ? 'rgba(0, 0, 0, 1)'
      : 'rgb(0, 0, 0)';
  }
};

// Function to replace unsupported color functions in styles
const replaceUnsupportedColors = (element: HTMLElement) => {
  // Process inline style attribute
  if (element.style.cssText) {
    element.style.cssText = element.style.cssText.replace(/lab\([^)]+\)/gi, match => {
      try {
        return convertLabToRgb(match);
      } catch (e) {
        console.warn('Failed to convert lab() color in inline style:', e);
        return 'rgb(0, 0, 0)';
      }
    });
  }

  // Get computed styles and replace lab() colors
  try {
    const computedStyle = window.getComputedStyle(element);
    const style = element.style;

    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'textDecorationColor',
      'columnRuleColor',
    ];

    colorProperties.forEach(prop => {
      try {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value.includes('lab(')) {
          const rgbValue = convertLabToRgb(value);
          style.setProperty(prop, rgbValue, 'important');
        }
      } catch {
        // Silently ignore errors for individual properties
      }
    });
  } catch {
    // If computed styles can't be accessed, continue
  }

  // Recursively process child elements
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      replaceUnsupportedColors(child);
    }
  });
};

export const usePdfGeneration = () => {
  const generatePdfFromHtml = useCallback(async (): Promise<string> => {
    const contractElement = document.getElementById('contract');
    if (!contractElement) {
      throw new Error('Contract element not found');
    }

    try {
      // Store original scroll position and styles
      const originalScrollTop = contractElement.scrollTop;
      const originalOverflow = contractElement.style.overflow;
      const originalHeight = contractElement.style.height;
      const originalMaxHeight = contractElement.style.maxHeight;

      // Temporarily adjust styles to capture full content
      contractElement.style.overflow = 'visible';
      contractElement.style.height = 'auto';
      contractElement.style.maxHeight = 'none';
      contractElement.scrollTop = 0;

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const scrollHeight = contractElement.scrollHeight;
      const scrollWidth = contractElement.scrollWidth;

      console.log(
        `PDF Generation: Contract dimensions - Height: ${scrollHeight}px, Width: ${scrollWidth}px`
      );

      if (scrollHeight === 0 || scrollWidth === 0) {
        throw new Error(
          `Invalid contract dimensions: Height=${scrollHeight}px, Width=${scrollWidth}px`
        );
      }

      // Use html2canvas to capture the FULL contract as an image
      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(contractElement, {
          scale: 1.5,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          allowTaint: true,
          removeContainer: false,
          height: scrollHeight,
          width: scrollWidth,
          windowWidth: scrollWidth,
          windowHeight: scrollHeight,
          onclone: clonedDoc => {
            const clonedElement = clonedDoc.getElementById('contract');
            if (clonedElement) {
              clonedElement.style.overflow = 'visible';
              clonedElement.style.height = 'auto';
              clonedElement.style.maxHeight = 'none';
              replaceUnsupportedColors(clonedElement as HTMLElement);

              const styleTags = clonedDoc.querySelectorAll('style');
              styleTags.forEach(styleTag => {
                if (styleTag.textContent) {
                  styleTag.textContent = styleTag.textContent.replace(/lab\([^)]+\)/gi, match => {
                    try {
                      return convertLabToRgb(match);
                    } catch (e) {
                      console.warn('Failed to convert lab() color in style tag:', e);
                      return '#000000';
                    }
                  });
                }
              });
            }
          },
        });
      } catch (canvasError) {
        console.error('html2canvas error:', canvasError);
        canvas = await html2canvas(contractElement, {
          scale: 1.0,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          allowTaint: false,
          onclone: clonedDoc => {
            const clonedElement = clonedDoc.getElementById('contract');
            if (clonedElement) {
              replaceUnsupportedColors(clonedElement as HTMLElement);
            }
          },
        });
      }

      // Restore original styles
      contractElement.style.overflow = originalOverflow;
      contractElement.style.height = originalHeight;
      contractElement.style.maxHeight = originalMaxHeight;
      contractElement.scrollTop = originalScrollTop;

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error(
          `Failed to create canvas: Width=${canvas?.width || 0}px, Height=${canvas?.height || 0}px`
        );
      }

      console.log(
        `PDF Generation: Canvas created - Width: ${canvas.width}px, Height: ${canvas.height}px`
      );

      // PDF dimensions (A4 size in mm)
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = pdfHeight - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      if (imgHeight <= 0 || imgWidth <= 0) {
        throw new Error(`Invalid image dimensions: Width=${imgWidth}mm, Height=${imgHeight}mm`);
      }

      // Helper function to find safe break points
      const findSafeBreakPoint = (
        startY: number,
        endY: number,
        canvas: HTMLCanvasElement
      ): number => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return endY;

        const imageData = ctx.getImageData(0, startY, canvas.width, endY - startY);
        const data = imageData.data;
        const threshold = 245;
        const minGapHeight = 20;
        const whitePixelRatio = 0.85;

        let bestBreakY = endY;
        let gapStart = -1;
        let bestGapHeight = 0;
        let bestGapY = endY;

        const searchHeight = endY - startY;
        for (let y = searchHeight - 1; y >= minGapHeight; y--) {
          let whiteCount = 0;
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

            if (gapHeight >= minGapHeight) {
              const gapY = startY + y;
              if (gapHeight > bestGapHeight || (gapHeight === bestGapHeight && gapY > bestGapY)) {
                bestGapHeight = gapHeight;
                bestGapY = gapY;
                bestBreakY = gapY;
              }
            }
          } else {
            gapStart = -1;
          }
        }

        return bestBreakY;
      };

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeightInPixels = contentHeight * (canvas.height / imgHeight);
      const totalPages = Math.ceil(imgHeight / contentHeight);

      console.log(
        `Generating PDF: ${totalPages} pages, image height: ${imgHeight}mm, content height per page: ${contentHeight}mm`
      );

      let currentY = 0;
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const idealEndY = Math.min(currentY + pageHeightInPixels, canvas.height);

        const searchStartY = Math.max(currentY + 100, idealEndY - pageHeightInPixels * 0.3);
        const safeBreakY = findSafeBreakPoint(searchStartY, idealEndY, canvas);

        const sourceY = currentY;
        const minHeight = pageHeightInPixels * 0.7;
        const maxHeight = pageHeightInPixels * 1.1;

        let actualEndY = idealEndY;
        if (
          safeBreakY < idealEndY &&
          safeBreakY > currentY + minHeight &&
          safeBreakY <= currentY + maxHeight
        ) {
          actualEndY = safeBreakY;
        }

        if (page === totalPages - 1) {
          actualEndY = canvas.height;
        }

        const actualSourceHeight = actualEndY - sourceY;

        if (actualSourceHeight < 50 && page < totalPages - 1) {
          const fallbackEndY = Math.min(currentY + pageHeightInPixels, canvas.height);
          const fallbackHeight = fallbackEndY - sourceY;

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = fallbackHeight;
          const pageCtx = pageCanvas.getContext('2d');

          if (!pageCtx) {
            throw new Error('Failed to get canvas context');
          }

          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            fallbackHeight,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
          const pageImgHeight = (fallbackHeight * imgWidth) / canvas.width;

          pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);

          currentY = fallbackEndY;
          continue;
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = actualSourceHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (!pageCtx) {
          throw new Error('Failed to get canvas context');
        }

        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          actualSourceHeight,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        const pageImgHeight = (actualSourceHeight * imgWidth) / canvas.width;

        pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);

        currentY = actualEndY;
      }

      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      const pdfSizeBytes = (pdfBase64.length * 3) / 4;
      const pdfSizeMB = pdfSizeBytes / (1024 * 1024);

      console.log(`PDF generated: ${pdfSizeMB.toFixed(2)} MB, ${totalPages} pages`);

      if (pdfSizeMB > 24) {
        console.warn(`⚠️ PDF size (${pdfSizeMB.toFixed(2)} MB) is close to Gmail's 25MB limit`);
      }

      return pdfBase64;
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred during PDF generation';
      console.error('Full error details:', {
        message: errorMessage,
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to generate PDF from contract: ${errorMessage}`);
    }
  }, []);

  return { generatePdfFromHtml };
};
