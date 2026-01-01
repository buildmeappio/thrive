export const ContractStyles = () => (
  <style jsx global>{`
    /* Page break styles */
    .page-break {
      page-break-after: always;
      break-after: page;
      display: block;
      margin: 2rem 0;
      border-top: 2px dashed #ccc;
      padding-top: 1rem;
    }

    /* Pages container */
    .pages-container {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
    }

    /* Page container styles */
    .page {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin: 2rem auto;
      position: relative;
      min-height: 1123px; /* A4 height at 96 DPI */
      height: auto;
      overflow: visible;
      page-break-inside: avoid;
      flex-shrink: 0;
      width: 100%;
      max-width: 794px; /* A4 width at 96 DPI */
      display: flex;
      flex-direction: column;
      clear: both;
      isolation: isolate; /* Create new stacking context */
      box-sizing: border-box;
    }

    /* Ensure pages don't overlap - add spacing */
    .page + .page {
      margin-top: 2rem;
    }

    /* Last page should not have page break */
    .page:last-child {
      page-break-after: auto;
    }

    /* Page header styles */
    .page-header {
      flex-shrink: 0;
      min-height: 40px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 40px;
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
      z-index: 10;
      flex-wrap: wrap;
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
      /* Ensure header doesn't overlap content */
      margin-bottom: 0;
    }

    .header-left,
    .header-center,
    .header-right {
      flex: 1;
      display: flex;
      align-items: flex-start;
      line-height: 1.4;
      min-height: 24px;
      padding: 4px 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      overflow: hidden;
      max-height: 100%;
    }

    .header-left {
      text-align: left;
      justify-content: flex-start;
    }

    .header-center {
      text-align: center;
      justify-content: center;
    }

    .header-right {
      text-align: right;
      justify-content: flex-end;
    }

    .header-left p,
    .header-center p,
    .header-right p {
      margin: 0;
      padding: 0;
      display: inline;
    }

    .header-left img,
    .header-center img,
    .header-right img {
      max-width: 150px;
      max-height: 60px;
      vertical-align: middle;
      display: inline-block;
      margin: 0 4px;
      object-fit: contain;
    }

    /* Page content styles */
    .page-content {
      flex: 1;
      margin: 0;
      padding: 20px 40px;
      position: relative;
      overflow: visible;
      word-wrap: break-word;
      line-height: 1.6;
      font-size: 14px;
      color: #333;
      background: white;
      min-height: 0;
      /* Ensure content doesn't overlap with header/footer */
      padding-top: 24px;
      padding-bottom: 24px;
      /* Account for header and footer heights */
      box-sizing: border-box;
      /* Add extra spacing to prevent text from being cut off */
      margin-top: 0;
      margin-bottom: 0;
    }

    /* Ensure first element in page-content has proper spacing */
    .page-content > *:first-child {
      margin-top: 0;
      padding-top: 0;
    }

    /* Ensure last element in page-content has proper spacing */
    .page-content > *:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }

    /* Page footer styles */
    .page-footer {
      flex-shrink: 0;
      min-height: 40px;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 40px;
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
      z-index: 10;
      flex-wrap: wrap;
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
      /* Ensure footer doesn't overlap content */
      margin-top: 0;
    }

    .footer-left,
    .footer-center,
    .footer-right {
      flex: 1;
      display: flex;
      align-items: flex-start;
      line-height: 1.4;
      min-height: 24px;
      padding: 4px 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      overflow: hidden;
      max-height: 100%;
    }

    .footer-left {
      text-align: left;
      justify-content: flex-start;
    }

    .footer-center {
      text-align: center;
      justify-content: center;
    }

    .footer-right {
      text-align: right;
      justify-content: flex-end;
    }

    .footer-left p,
    .footer-center p,
    .footer-right p {
      margin: 0;
      padding: 0;
      display: inline;
    }

    .footer-left img,
    .footer-center img,
    .footer-right img {
      max-width: 150px;
      max-height: 60px;
      vertical-align: middle;
      display: inline-block;
      margin: 0 4px;
      object-fit: contain;
    }

    /* Checkbox group styles */
    .checkbox-group-variable {
      margin: 12px 0;
    }
    .checkbox-group-variable label {
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
    }
    .checkbox-group-variable .checkbox-options {
      margin-top: 8px;
    }
    .checkbox-group-variable .checkbox-options > div {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }
    .checkbox-group-variable .checkbox-indicator {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #333;
      margin-right: 8px;
      vertical-align: middle;
      flex-shrink: 0;
      text-align: center;
      line-height: 12px;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }
    .checkbox-group-variable .checkbox-indicator:hover {
      background-color: #f0f0f0;
    }
    .checkbox-group-variable label {
      font-weight: normal;
      margin-bottom: 0;
      cursor: pointer;
    }
    .prose table {
      border-collapse: collapse;
      margin: 1rem 0;
      overflow: hidden;
      width: 100%;
    }
    .prose table td,
    .prose table th {
      border: 1px solid #d1d5db;
      box-sizing: border-box;
      min-width: 1em;
      padding: 0.5rem;
      position: relative;
      vertical-align: top;
    }
    /* Preserve text-align from inline styles - inline styles have highest specificity */
    .prose table td[style*="text-align: left"],
    .prose table th[style*="text-align: left"] {
      text-align: left !important;
    }
    .prose table td[style*="text-align: center"],
    .prose table th[style*="text-align: center"] {
      text-align: center !important;
    }
    .prose table td[style*="text-align: right"],
    .prose table th[style*="text-align: right"] {
      text-align: right !important;
    }
    /* Ensure table cells respect alignment attributes */
    .prose table td[align="left"],
    .prose table th[align="left"] {
      text-align: left;
    }
    .prose table td[align="center"],
    .prose table th[align="center"] {
      text-align: center;
    }
    .prose table td[align="right"],
    .prose table th[align="right"] {
      text-align: right;
    }
    .prose table th {
      background-color: #f3f4f6;
      font-weight: 600;
    }
    .prose img {
      max-width: 100%;
      height: auto;
      display: inline-block;
    }
    .prose ul[data-type="taskList"] {
      list-style: none;
      padding: 0;
    }
    .prose ul[data-type="taskList"] li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .prose hr {
      border: none;
      border-top: 1px solid #d1d5db;
      margin: 1rem 0;
    }
    .prose blockquote {
      border-left: 4px solid #d1d5db;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6b7280;
      font-style: italic;
    }
    .prose pre {
      background: #f3f4f6;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
    }
    .prose code {
      background: #f3f4f6;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family:
        ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
    }
    /* Ensure inline styles from TipTap take precedence over prose styles */
    .prose [style] {
      /* Inline styles already have highest specificity */
    }
  `}</style>
);
