import { useEffect } from 'react';
import { UseContractDomUpdatesProps } from '../../types/contract.types';

export const useContractDomUpdates = ({
  contractHtml,
  signatureImage,
  sigName,
  sigDate,
  checkboxValues,
  checkboxGroups,
}: UseContractDomUpdatesProps) => {
  useEffect(() => {
    // Use a small delay to ensure DOM is ready and ContractContent has finished updating
    const timeoutId = setTimeout(() => {
      const contractEl = document.getElementById('contract');
      if (!contractEl) return;

      const updateTargets = (selectors: string[], updater: (el: HTMLElement) => void): boolean => {
        let matched = false;
        selectors.forEach(selector => {
          contractEl.querySelectorAll<HTMLElement>(selector).forEach(el => {
            matched = true;
            updater(el);
          });
        });
        return matched;
      };

      const normalized = (value: string | null | undefined) =>
        value
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .trim() ?? '';

      const blockTags = new Set([
        'P',
        'DIV',
        'SECTION',
        'ARTICLE',
        'TABLE',
        'TBODY',
        'TR',
        'TD',
        'LI',
        'UL',
        'OL',
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
      ]);

      const findSignatureBlock = () => {
        const walker = document.createTreeWalker(contractEl, NodeFilter.SHOW_TEXT);

        while (walker.nextNode()) {
          const textNode = walker.currentNode as Text;
          if (normalized(textNode.textContent).includes('examiner signature')) {
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
            const text = normalized(nextSibling?.textContent || '');
            if (
              text.includes('date') &&
              !text.includes('effective date') &&
              !text.includes('for platform')
            ) {
              return nextSibling;
            }
            current = nextElement;
          } else {
            const parent = current.parentElement;
            if (parent && parent !== contractEl) {
              const parentNext = parent.nextElementSibling;
              if (parentNext) {
                const text = normalized(parentNext.textContent || '');
                if (
                  text.includes('date') &&
                  !text.includes('effective date') &&
                  !text.includes('for platform')
                ) {
                  return parentNext as HTMLElement;
                }
              }
            }
            break;
          }
          checkedCount++;
        }

        const dateWalker = document.createTreeWalker(contractEl, NodeFilter.SHOW_TEXT);

        let foundExaminerSignature = false;
        while (dateWalker.nextNode()) {
          const textNode = dateWalker.currentNode as Text;
          const text = normalized(textNode.textContent);

          if (text.includes('examiner signature')) {
            foundExaminerSignature = true;
            continue;
          }

          if (foundExaminerSignature) {
            if (
              text.includes('date') &&
              !text.includes('effective date') &&
              !text.includes('for platform')
            ) {
              let el = textNode.parentElement;
              while (el && !blockTags.has(el.tagName)) {
                el = el.parentElement;
              }
              return el ?? textNode.parentElement ?? null;
            }

            if (blockTags.has(textNode.parentElement?.tagName || '')) {
              break;
            }
          }
        }

        return null;
      };

      const ensureDynamicContainer = () => {
        let dynamicContainer = contractEl.querySelector<HTMLElement>(
          '#contract-dynamic-examiner-signature'
        );

        if (!dynamicContainer) {
          const examinerLabel = findSignatureBlock();
          if (examinerLabel) {
            dynamicContainer = document.createElement('div');
            dynamicContainer.id = 'contract-dynamic-examiner-signature';
            dynamicContainer.style.marginTop = '8px';
            dynamicContainer.style.minHeight = '60px';
            dynamicContainer.style.display = 'flex';
            dynamicContainer.style.alignItems = 'flex-start';
            dynamicContainer.style.gap = '12px';
            examinerLabel.insertAdjacentElement('afterend', dynamicContainer);
          }
        }

        return dynamicContainer;
      };

      // FIRST: Replace {{application.examiner_signature}} placeholder with signature image
      // This must happen BEFORE checking for fallback containers
      let signatureReplacedAtPlaceholder = false;
      if (signatureImage) {
        // Check spans with data-variable or title attributes (most reliable)
        const signatureSpans = contractEl.querySelectorAll<HTMLElement>(
          '[data-variable="application.examiner_signature"], [data-variable*="application.examiner_signature"], [title*="application.examiner_signature"], [title*="{{application.examiner_signature}}"]'
        );
        signatureSpans.forEach(span => {
          if (!span.querySelector("img[data-signature='examiner']")) {
            // Check if span contains the placeholder text
            const spanText = span.textContent || '';
            if (
              spanText.includes('application.examiner_signature') ||
              spanText.includes('{{application.examiner_signature}}') ||
              span.getAttribute('data-variable')?.includes('application.examiner_signature') ||
              span.getAttribute('title')?.includes('application.examiner_signature')
            ) {
              span.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" data-signature="examiner" style="max-width: 240px; height: auto; display: inline-block;" />`;
              span.style.borderBottom = 'none';
              span.style.textDecoration = 'none';
              span.style.display = 'inline-block';
              signatureReplacedAtPlaceholder = true;
            }
          } else {
            signatureReplacedAtPlaceholder = true; // Already has signature
          }
        });

        // If not found in spans, search text nodes
        if (!signatureReplacedAtPlaceholder) {
          const signaturePlaceholderWalker = document.createTreeWalker(
            contractEl,
            NodeFilter.SHOW_TEXT
          );
          while (signaturePlaceholderWalker.nextNode()) {
            const textNode = signaturePlaceholderWalker.currentNode as Text;
            const textContent = textNode.textContent || '';
            if (
              textContent.includes('application.examiner_signature') ||
              textContent.includes('{{application.examiner_signature}}')
            ) {
              const parent = textNode.parentElement;
              if (parent) {
                // Check if already replaced (contains img tag)
                if (parent.querySelector("img[data-signature='examiner']")) {
                  signatureReplacedAtPlaceholder = true;
                  break;
                }

                // Replace the placeholder with img tag
                const newText = textContent.replace(
                  /\{\{\s*application\.examiner_signature\s*\}\}/gi,
                  ''
                );

                // Create img element
                const img = document.createElement('img');
                img.src = signatureImage;
                img.alt = 'Examiner Signature';
                img.setAttribute('data-signature', 'examiner');
                img.style.maxWidth = '240px';
                img.style.height = 'auto';
                img.style.display = 'inline-block';

                // Replace parent content if it's mostly just the placeholder
                if (
                  parent.textContent?.trim() === '' ||
                  parent.textContent?.trim() === '{{application.examiner_signature}}' ||
                  parent.textContent?.trim().includes('{{application.examiner_signature}}')
                ) {
                  parent.innerHTML = '';
                  parent.appendChild(img);
                } else {
                  // Replace just the placeholder text
                  textNode.textContent = newText;
                  parent.insertBefore(img, textNode.nextSibling);
                }

                // Remove underline styling from parent if it exists
                if (parent instanceof HTMLElement) {
                  parent.style.borderBottom = 'none';
                  parent.style.textDecoration = 'none';
                }
                signatureReplacedAtPlaceholder = true;
                break;
              }
            }
          }
        }

        // Mark that signature was replaced to prevent fallback container creation
        if (signatureReplacedAtPlaceholder) {
          contractEl.setAttribute('data-signature-replaced', 'true');
        }
      }

      // Update signature image targets (for specific selectors like [data-signature="examiner"])
      const hasImageTarget = updateTargets(
        [
          '[data-contract-signature="image"]',
          '[data-signature="examiner"]',
          '#examiner-signature',
          '.examiner-signature',
        ],
        el => {
          // Only update if signatureImage exists - preserve existing signature if it's already there
          if (signatureImage) {
            // Check if signature already exists to avoid unnecessary updates
            const existingImg = el.querySelector('img');
            if (!existingImg || existingImg.src !== signatureImage) {
              el.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
            }
          }
          // Don't clear if signatureImage is falsy - preserve existing signature
        }
      );

      // Only create fallback container if signature wasn't replaced at placeholder location
      const dynamicContainer =
        hasImageTarget || signatureReplacedAtPlaceholder ? null : ensureDynamicContainer();

      if (dynamicContainer && !signatureReplacedAtPlaceholder) {
        // Only update if signatureImage exists - don't clear if it's already there
        if (signatureImage) {
          // Check if signature already exists to avoid unnecessary updates
          const existingImg = dynamicContainer.querySelector('img');
          if (!existingImg || existingImg.src !== signatureImage) {
            dynamicContainer.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
          }
        }
        // Don't clear the container if signatureImage is falsy - preserve existing signature
      } else if (!hasImageTarget && !signatureReplacedAtPlaceholder && signatureImage) {
        // Only create fallback if signature wasn't replaced at placeholder
        let fallback = contractEl.querySelector<HTMLElement>(
          '#contract-dynamic-examiner-signature'
        );
        if (!fallback) {
          fallback = document.createElement('div');
          fallback.id = 'contract-dynamic-examiner-signature';
          fallback.style.marginTop = '12px';
          fallback.style.minHeight = '60px';
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'flex-start';
          fallback.style.gap = '12px';
          contractEl.appendChild(fallback);
        }
        // Check if signature already exists to avoid unnecessary updates
        const existingImg = fallback.querySelector('img');
        if (!existingImg || existingImg.src !== signatureImage) {
          fallback.innerHTML = `<img src="${signatureImage}" alt="Examiner Signature" style="max-width: 240px; height: auto;" />`;
        }
      }
      // Don't remove the signature container even if signatureImage is falsy
      // This prevents signature from disappearing when checkbox is ticked

      const formattedDate = sigDate ? new Date(sigDate).toLocaleDateString('en-CA') : '';

      const dateField = findDateFieldAfterSignature();
      if (dateField && formattedDate) {
        const currentText = dateField.textContent || '';
        const normalizedCurrent = normalized(currentText);

        if (normalizedCurrent.includes('date') && !currentText.includes(formattedDate)) {
          const underscorePattern = /_{10,}/g;
          const textWithDateReplaced = currentText.replace(underscorePattern, formattedDate);

          const finalText =
            textWithDateReplaced !== currentText
              ? textWithDateReplaced
              : currentText.trim().endsWith(':')
                ? `${currentText.trim()} ${formattedDate}`
                : currentText.trim()
                  ? `${currentText.trim()}: ${formattedDate}`
                  : `Date: ${formattedDate}`;

          const dateInput = dateField.querySelector<HTMLElement>('input, span, div, p');
          if (dateInput) {
            const inputText = dateInput.textContent || '';
            if (!inputText.includes(formattedDate)) {
              const inputWithDateReplaced = inputText.replace(underscorePattern, formattedDate);
              if (inputWithDateReplaced !== inputText) {
                dateInput.textContent = inputWithDateReplaced;
              } else {
                dateInput.textContent = inputText.trim().endsWith(':')
                  ? `${inputText.trim()} ${formattedDate}`
                  : `${inputText.trim()}: ${formattedDate}`;
              }
            }
          } else {
            const textNodes = Array.from(dateField.childNodes).filter(
              node => node.nodeType === Node.TEXT_NODE
            );
            if (textNodes.length > 0) {
              const textNode = textNodes[0] as Text;
              const nodeText = textNode.textContent || '';
              if (!nodeText.includes(formattedDate)) {
                const nodeWithDateReplaced = nodeText.replace(underscorePattern, formattedDate);
                if (nodeWithDateReplaced !== nodeText) {
                  textNode.textContent = nodeWithDateReplaced;
                } else {
                  textNode.textContent = nodeText.trim().endsWith(':')
                    ? `${nodeText.trim()} ${formattedDate}`
                    : `${nodeText.trim()}: ${formattedDate}`;
                }
              }
            } else {
              if (!currentText.includes(formattedDate)) {
                dateField.textContent = finalText;
              }
            }
          }
        }
      }

      updateTargets(
        [
          '[data-contract-signature="name"]',
          '#examiner-signature-name',
          '.examiner-signature-name',
        ],
        el => {
          el.textContent = sigName || '';
        }
      );

      updateTargets(
        [
          '[data-contract-signature="date"]',
          '#examiner-signature-date',
          '.examiner-signature-date',
        ],
        el => {
          el.textContent = formattedDate;
        }
      );

      // Update application.examiner_signature_date_time placeholder if signature exists
      // This shows the current date/time when signing
      if (signatureImage) {
        const signatureDateTime = new Date().toISOString();
        const formattedDateTime = new Date(signatureDateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        // ZERO: First, try to find and replace any spans that contain underscores and have the placeholder in title
        // This handles the case where the admin side rendered it with underline styling
        const allSpansWithUnderscores = contractEl.querySelectorAll<HTMLElement>('span');
        allSpansWithUnderscores.forEach(span => {
          const title = span.getAttribute('title');
          const textContent = span.textContent || '';
          const hasUnderscores = textContent.includes('_') && textContent.trim().length > 0;
          const hasPlaceholderInTitle =
            title?.includes('application.examiner_signature_date_time') ||
            title?.includes('examiner.signature_date_time');

          if (hasUnderscores && hasPlaceholderInTitle) {
            span.textContent = formattedDateTime;
            span.style.borderBottom = 'none';
            span.style.textDecoration = 'none';
            span.style.background = 'none';
            span.style.padding = '0';
            span.style.borderRadius = '0';
            span.style.fontWeight = 'normal';
            span.removeAttribute('title');
          }
        });

        // FIRST: Check spans with data-variable or title attributes for application.examiner_signature_date_time
        const signatureDateTimeSpans = contractEl.querySelectorAll<HTMLElement>(
          '[data-variable="application.examiner_signature_date_time"], [data-variable*="application.examiner_signature_date_time"], [title*="application.examiner_signature_date_time"], [title*="{{application.examiner_signature_date_time}}"], [title="application.examiner_signature_date_time"]'
        );
        signatureDateTimeSpans.forEach(span => {
          span.textContent = formattedDateTime;
          span.style.borderBottom = 'none';
          span.style.textDecoration = 'none';
          span.style.background = 'none';
          span.style.padding = '0';
          span.style.borderRadius = '0';
          span.style.fontWeight = 'normal';
          // Remove the title attribute to avoid confusion
          span.removeAttribute('title');
        });

        // SECOND: Also check for legacy examiner.signature_date_time format
        const legacySignatureDateTimeSpans = contractEl.querySelectorAll<HTMLElement>(
          '[data-variable="examiner.signature_date_time"], [title="{{examiner.signature_date_time}}"]'
        );
        legacySignatureDateTimeSpans.forEach(span => {
          span.textContent = formattedDateTime;
          span.style.borderBottom = 'none';
          span.style.textDecoration = 'none';
        });

        // THIRD: Try to find by text content containing the placeholder
        if (signatureDateTimeSpans.length === 0 && legacySignatureDateTimeSpans.length === 0) {
          const walker = document.createTreeWalker(contractEl, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const textNode = walker.currentNode as Text;
            const textContent = textNode.textContent || '';
            if (
              textContent.includes('application.examiner_signature_date_time') ||
              textContent.includes('{{application.examiner_signature_date_time}}') ||
              textContent.includes('examiner.signature_date_time') ||
              textContent.includes('{{examiner.signature_date_time}}')
            ) {
              // Replace the placeholder text
              const parent = textNode.parentElement;
              if (parent) {
                const newText = textContent
                  .replace(
                    /\{\{\s*application\.examiner_signature_date_time\s*\}\}/gi,
                    formattedDateTime
                  )
                  .replace(/\{\{\s*examiner\.signature_date_time\s*\}\}/gi, formattedDateTime);
                textNode.textContent = newText;
                // Remove underline styling from parent if it exists
                if (parent instanceof HTMLElement) {
                  parent.style.borderBottom = 'none';
                  parent.style.textDecoration = 'none';
                  parent.style.background = 'none';
                  parent.style.padding = '0';
                  parent.style.borderRadius = '0';
                  parent.style.fontWeight = 'normal';
                  // Remove title attribute if it contains the placeholder
                  const title = parent.getAttribute('title');
                  if (title?.includes('signature_date_time')) {
                    parent.removeAttribute('title');
                  }
                }
              }
              break;
            }
          }
        }

        // FOURTH: Also update any spans with the variable placeholder (legacy support)
        // This catches spans that might have been created with the underline styling
        const allSpans = contractEl.querySelectorAll<HTMLElement>('span');
        allSpans.forEach(span => {
          const title = span.getAttribute('title');
          const dataVar = span.getAttribute('data-variable');
          const textContent = span.textContent || '';
          // Check if this span contains the placeholder text or has the placeholder in title/data-variable
          if (
            title?.includes('application.examiner_signature_date_time') ||
            title?.includes('examiner.signature_date_time') ||
            dataVar === 'application.examiner_signature_date_time' ||
            dataVar === 'examiner.signature_date_time' ||
            textContent.includes('application.examiner_signature_date_time') ||
            textContent.includes('{{application.examiner_signature_date_time}}') ||
            textContent.includes('examiner.signature_date_time') ||
            textContent.includes('{{examiner.signature_date_time}}') ||
            (textContent.includes('________________') && title?.includes('signature_date_time'))
          ) {
            span.textContent = formattedDateTime;
            span.style.borderBottom = 'none';
            span.style.textDecoration = 'none';
            span.style.background = 'none';
            span.style.padding = '0';
            span.style.borderRadius = '0';
            span.style.fontWeight = 'normal';
            span.removeAttribute('title');
          }
        });
      }

      // Checkboxes are read-only - they remain as displayed in the contract HTML
      // No interaction needed, they're just visual elements
    }, 50); // Small delay to ensure DOM is ready and ContractContent has finished updating

    return () => clearTimeout(timeoutId);
  }, [contractHtml, signatureImage, sigName, sigDate, checkboxValues, checkboxGroups]);
};
