import { useState, useEffect } from 'react';
import type { CheckboxGroup } from '../../types/contract.types';

export type { CheckboxGroup };

// Simplified checkbox parsing - extracts core logic
const parseCheckboxGroups = (sourceElement: HTMLElement | DocumentFragment): CheckboxGroup[] => {
  const groups: CheckboxGroup[] = [];

  // Try data attribute first
  let checkboxGroupElements = sourceElement.querySelectorAll<HTMLElement>(
    '[data-variable-type="checkbox_group"]'
  );

  // Fallback: find by Unicode checkbox characters
  if (checkboxGroupElements.length === 0) {
    const allElements = sourceElement.querySelectorAll<HTMLElement>('*');
    const checkboxElements: HTMLElement[] = [];

    allElements.forEach(el => {
      const text = el.textContent || '';
      const trimmed = text.trim();
      if (
        trimmed === '☐' ||
        trimmed === '☑' ||
        (trimmed.length <= 3 && (trimmed.includes('☐') || trimmed.includes('☑')))
      ) {
        checkboxElements.push(el);
      }
    });

    if (checkboxElements.length >= 2) {
      let commonParent: HTMLElement | null = null;
      if (checkboxElements.length > 0) {
        let candidate = checkboxElements[0].parentElement;
        while (candidate && candidate !== sourceElement) {
          const containsAll = checkboxElements.every(el => candidate!.contains(el));
          if (containsAll) {
            const checkboxCount = checkboxElements.filter(el => candidate!.contains(el)).length;
            if (checkboxCount >= 2) {
              commonParent = candidate;
              break;
            }
          }
          if (candidate.id === 'contract' || candidate.classList.contains('prose')) {
            break;
          }
          candidate = candidate.parentElement;
        }
      }

      if (commonParent) {
        (commonParent as any).__checkboxElements = checkboxElements;
        checkboxGroupElements = [commonParent] as any;
      }
    }
  }

  checkboxGroupElements.forEach((group, idx) => {
    let variableKey = group.getAttribute('data-variable-key');
    if (!variableKey) {
      const labelElement = group.querySelector('label');
      if (labelElement) {
        const labelText = labelElement.textContent?.trim() || '';
        const normalizedLabel = labelText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        variableKey = `custom.${normalizedLabel}`;
      } else {
        variableKey = `custom.checkbox_group_${idx}`;
      }
    }

    if (!variableKey) return;

    // Only include custom variables (those starting with "custom.")
    // Exclude system variables like "thrive.*", "examiner.*", "contract.*", "fee.*"
    if (!variableKey.startsWith('custom.')) {
      console.log(`🚫 Filtering out non-custom checkbox group: ${variableKey}`);
      return;
    }

    // Also exclude custom variables that contain system namespaces (e.g., "custom.thrive.primary_discipline")
    if (
      variableKey.includes('.thrive.') ||
      variableKey.includes('.examiner.') ||
      variableKey.includes('.contract.') ||
      variableKey.includes('.fee.') ||
      variableKey.startsWith('custom.thrive.') ||
      variableKey.startsWith('custom.examiner.') ||
      variableKey.startsWith('custom.contract.') ||
      variableKey.startsWith('custom.fee.')
    ) {
      console.log(`🚫 Filtering out custom checkbox group with system namespace: ${variableKey}`);
      return;
    }

    console.log(`✅ Including custom checkbox group: ${variableKey}`);

    let labelElement = group.querySelector('label.font-semibold');
    if (!labelElement) {
      labelElement = group.querySelector('label');
    }
    if (!labelElement) {
      labelElement = group.querySelector('h1, h2, h3, h4, h5, h6, strong, b') as HTMLElement;
    }

    let label = labelElement?.textContent?.trim() || '';
    if (!label) {
      // Remove "custom." prefix and any system namespace prefixes
      label = variableKey
        .replace(/^custom\./, '')
        .replace(/^(thrive|examiner|contract|fee)\./, '') // Remove system namespace if present
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    // Remove any "Thrive." prefix that might be in the label text
    label = label.replace(/^Thrive\.\s*/i, '').replace(/:\s*$/, '');

    const options: Array<{ label: string; value: string }> = [];
    let indicators = group.querySelectorAll<HTMLElement>(
      '.checkbox-indicator[data-checkbox-value]'
    );

    if (indicators.length === 0) {
      const storedElements = (group as any).__checkboxElements;
      if (storedElements && storedElements.length > 0) {
        indicators = storedElements;
      } else {
        const allElements = group.querySelectorAll<HTMLElement>('*');
        const tempIndicators: HTMLElement[] = [];
        allElements.forEach(el => {
          const text = el.textContent || '';
          const trimmed = text.trim();
          if (
            trimmed === '☐' ||
            trimmed === '☑' ||
            (trimmed.length <= 3 && (trimmed.includes('☐') || trimmed.includes('☑')))
          ) {
            tempIndicators.push(el);
          }
        });
        if (tempIndicators.length > 0) {
          indicators = tempIndicators as any;
        }
      }
    }

    indicators.forEach((indicator, optIdx) => {
      let value = indicator.getAttribute('data-checkbox-value');
      let optionLabel = '';

      if (indicator.tagName === 'P' && indicator.textContent) {
        const text = indicator.textContent.trim();
        const match = text.match(/^[☐☑]\s*(.+)$/);
        if (match) {
          optionLabel = match[1].trim();
        } else {
          optionLabel = text.replace(/^[☐☑]\s*/, '').trim();
        }

        if (optionLabel && !value) {
          value = optionLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        }
      }

      if (!value) {
        if (optionLabel) {
          value = optionLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        } else {
          value = `option_${optIdx}`;
        }
      }

      if (!optionLabel) {
        const parentDiv = indicator.parentElement;
        if (parentDiv) {
          const labelEl = parentDiv.querySelector('label');
          optionLabel = labelEl?.textContent?.trim() || '';
        }

        if (!optionLabel) {
          optionLabel = value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }

      if (value) {
        options.push({ label: optionLabel, value });
      }
    });

    if (options.length > 0) {
      groups.push({ variableKey, label, options });
    }
  });

  return groups;
};

export const useCheckboxGroups = (
  contractHtml: string,
  checkboxGroupsFromTemplate?: CheckboxGroup[]
) => {
  const [checkboxGroups, setCheckboxGroups] = useState<CheckboxGroup[]>([]);
  const [checkboxValues, setCheckboxValues] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // If checkbox groups are provided from template, use them first
    if (checkboxGroupsFromTemplate && checkboxGroupsFromTemplate.length > 0) {
      // Filter to only include custom variables (those starting with "custom.")
      // and exclude those with system namespaces
      const filteredGroups = checkboxGroupsFromTemplate.filter(group => {
        const key = group.variableKey;
        if (!key.startsWith('custom.')) return false;
        // Exclude custom variables that contain system namespaces
        if (
          key.includes('.thrive.') ||
          key.includes('.examiner.') ||
          key.includes('.contract.') ||
          key.includes('.fee.') ||
          key.startsWith('custom.thrive.') ||
          key.startsWith('custom.examiner.') ||
          key.startsWith('custom.contract.') ||
          key.startsWith('custom.fee.')
        ) {
          return false;
        }
        return true;
      });
      console.log(
        `✅ Using ${filteredGroups.length} custom checkbox groups from template (filtered from ${checkboxGroupsFromTemplate.length} total)`
      );
      if (filteredGroups.length !== checkboxGroupsFromTemplate.length) {
        const filteredOut = checkboxGroupsFromTemplate.filter(group => {
          const key = group.variableKey;
          if (!key.startsWith('custom.')) return true;
          if (
            key.includes('.thrive.') ||
            key.includes('.examiner.') ||
            key.includes('.contract.') ||
            key.includes('.fee.') ||
            key.startsWith('custom.thrive.') ||
            key.startsWith('custom.examiner.') ||
            key.startsWith('custom.contract.') ||
            key.startsWith('custom.fee.')
          ) {
            return true;
          }
          return false;
        });
        console.log(
          `🚫 Filtered out ${filteredOut.length} groups with system namespaces:`,
          filteredOut.map(g => `${g.variableKey} (${g.label})`)
        );
      }
      setCheckboxGroups(filteredGroups);
      return;
    }

    if (!contractHtml) {
      setCheckboxGroups([]);
      return;
    }

    const parseFromDOM = () => {
      const contractEl =
        document.getElementById('contract') || document.getElementById('contract-content');
      if (contractEl) {
        const groups = parseCheckboxGroups(contractEl);
        if (groups.length > 0) {
          setCheckboxGroups(groups);
          return true;
        }
      }
      return false;
    };

    // Try HTML string first
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contractHtml;
    const htmlGroups = parseCheckboxGroups(tempDiv);
    console.log(`🔍 Parsed ${htmlGroups.length} checkbox groups from HTML string`);
    if (htmlGroups.length > 0) {
      console.log(`✅ Found checkbox groups:`, htmlGroups);
      setCheckboxGroups(htmlGroups);
      return;
    }
    console.log(`⚠️ No checkbox groups found in HTML string, trying DOM...`);

    // Try DOM
    if (parseFromDOM()) {
      return;
    }

    // Use MutationObserver as fallback
    const contractEl =
      document.getElementById('contract') || document.getElementById('contract-content');
    let observer: MutationObserver | null = null;

    if (contractEl) {
      observer = new MutationObserver(() => {
        if (parseFromDOM()) {
          observer?.disconnect();
        }
      });
      observer.observe(contractEl, {
        childList: true,
        subtree: true,
      });
    }

    const timers = [
      setTimeout(() => parseFromDOM(), 100),
      setTimeout(() => parseFromDOM(), 500),
      setTimeout(() => parseFromDOM(), 1000),
      setTimeout(() => {
        parseFromDOM();
        observer?.disconnect();
      }, 2000),
    ];

    return () => {
      observer?.disconnect();
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [contractHtml, checkboxGroupsFromTemplate]);

  return {
    checkboxGroups,
    checkboxValues,
    setCheckboxValues,
  };
};
