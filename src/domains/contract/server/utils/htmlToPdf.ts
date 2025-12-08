"use server";

/**
 * Converts HTML content to PDF using Puppeteer
 * Requires puppeteer package to be installed: npm install puppeteer
 */
export async function convertHtmlToPdf(htmlContent: string): Promise<Buffer> {
  try {
    // Dynamic import to avoid loading puppeteer if not installed
    let puppeteer: any;
    try {
      puppeteer = await import("puppeteer");
    } catch (_importError) {
      throw new Error(
        "Puppeteer is not installed. Please install it by running: npm install puppeteer"
      );
    }
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();
      
      // Set content with proper encoding
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    throw new Error(`Failed to convert HTML to PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

