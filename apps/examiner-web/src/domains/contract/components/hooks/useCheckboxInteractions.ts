import { useEffect } from 'react';
import { UseCheckboxInteractionsProps } from '../../types/contract.types';

export const useCheckboxInteractions = ({
  contractHtml,
  checkboxValues,
  checkboxGroups,
  setCheckboxValues,
}: UseCheckboxInteractionsProps) => {
  useEffect(() => {
    let handlers: Array<() => void> = [];

    const timer = setTimeout(() => {
      const contractEl =
        document.getElementById('contract') || document.getElementById('contract-content');
      if (!contractEl) {
        console.warn('Contract element not found');
        return;
      }

      const checkboxGroupElements = contractEl.querySelectorAll<HTMLElement>(
        '[data-variable-type="checkbox_group"]'
      );

      handlers = [];

      checkboxGroupElements.forEach(group => {
        const variableKey = group.getAttribute('data-variable-key');
        if (!variableKey) return;

        setCheckboxValues(prev => {
          if (!prev[variableKey]) {
            return { ...prev, [variableKey]: [] };
          }
          return prev;
        });

        const checkboxIndicators = group.querySelectorAll<HTMLElement>(
          '.checkbox-indicator[data-checkbox-value]'
        );

        checkboxIndicators.forEach(indicator => {
          const value = indicator.getAttribute('data-checkbox-value');
          if (!value) return;

          indicator.style.cursor = 'pointer';
          indicator.style.userSelect = 'none';

          const currentValues = checkboxValues[variableKey] || [];
          const isChecked = currentValues.includes(value);
          indicator.textContent = isChecked ? '☑' : '☐';
          indicator.style.backgroundColor = isChecked ? '#e3f2fd' : 'transparent';

          const handleClick = () => {
            setCheckboxValues(prev => {
              const currentValues = prev[variableKey] || [];
              const wasChecked = currentValues.includes(value);
              const newValues = wasChecked
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

              const contractContainer =
                document.getElementById('contract-content') || document.getElementById('contract');
              if (!contractContainer) return prev;

              const groupIndicators = contractContainer.querySelectorAll<HTMLElement>(
                `[data-variable-type="checkbox_group"][data-variable-key="${variableKey}"] .checkbox-indicator[data-checkbox-value="${value}"]`
              );

              groupIndicators.forEach(ind => {
                const indValue = ind.getAttribute('data-checkbox-value');
                const isNowChecked = newValues.includes(indValue || '');
                ind.textContent = isNowChecked ? '☑' : '☐';
                ind.style.backgroundColor = isNowChecked ? '#e3f2fd' : 'transparent';
              });

              return {
                ...prev,
                [variableKey]: newValues,
              };
            });
          };

          indicator.addEventListener('click', handleClick);
          handlers.push(() => indicator.removeEventListener('click', handleClick));
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      handlers.forEach(cleanup => cleanup());
    };
  }, [contractHtml, checkboxValues, setCheckboxValues]);
};
