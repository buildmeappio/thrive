import type { TourType } from '../types/tour';

const DASHBOARD_REQUIRED_ELEMENTS = [
  'new-case-offers',
  'upcoming-appointments',
  'reports-table',
  'recent-updates',
  'summary-panel',
  'settings-button',
];

export interface ElementCheckResult {
  foundElements: string[];
  missingElements: string[];
  allFound: boolean;
}

export function checkTourElements(
  tourType: TourType,
  maxRetries = 50
): Promise<ElementCheckResult> {
  return new Promise(resolve => {
    // For non-dashboard tours, elements are always ready
    if (tourType !== 'dashboard') {
      resolve({
        foundElements: [],
        missingElements: [],
        allFound: true,
      });
      return;
    }

    let retryCount = 0;

    const checkElements = () => {
      retryCount++;
      const foundElements: string[] = [];
      const missingElements: string[] = [];

      DASHBOARD_REQUIRED_ELEMENTS.forEach(attr => {
        const element = document.querySelector(`[data-tour="${attr}"]`) as HTMLElement;
        if (
          element &&
          element instanceof HTMLElement &&
          typeof element.getBoundingClientRect === 'function'
        ) {
          try {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              foundElements.push(attr);
            } else {
              missingElements.push(`${attr} (no dimensions)`);
            }
          } catch (error) {
            console.warn(`[Tour] Error getting bounding rect for ${attr}:`, error);
            missingElements.push(`${attr} (error)`);
          }
        } else {
          missingElements.push(attr);
        }
      });

      if (missingElements.length === 0) {
        console.log('[Tour] All dashboard elements found:', foundElements);
        resolve({
          foundElements,
          missingElements: [],
          allFound: true,
        });
      } else if (retryCount >= maxRetries) {
        console.warn('[Tour] Some elements not found after max retries:', missingElements);
        resolve({
          foundElements,
          missingElements,
          allFound: false,
        });
      } else {
        // Retry after a short delay
        setTimeout(checkElements, 200);
      }
    };

    // Start checking after a delay to allow DOM to render
    setTimeout(checkElements, 100);
  });
}

export function findElementByTourAttribute(tourAttribute: string): HTMLElement | null {
  // Try direct selector first
  let element = document.querySelector(`[data-tour="${tourAttribute}"]`) as HTMLElement | null;

  // If not found and it's the complete button, try alternative selectors
  if (!element && tourAttribute === 'complete-onboarding-button') {
    // Try finding by button text
    const buttons = Array.from(document.querySelectorAll('button')) as HTMLElement[];
    element =
      buttons.find(
        btn =>
          btn.textContent?.includes('Complete Onboarding') ||
          btn.querySelector('span')?.textContent?.includes('Complete Onboarding')
      ) || null;

    // If found, ensure it has the data-tour attribute
    if (element && !element.hasAttribute('data-tour')) {
      element.setAttribute('data-tour', 'complete-onboarding-button');
    }
  }

  return element;
}

export function findSettingsButton(): HTMLElement | null {
  // Try data-tour attribute first
  let element = findElementByTourAttribute('settings-button');

  // Fallback: try finding by href if data-tour is not set
  if (!element) {
    element = document.querySelector(
      'a[href*="/settings"], a[href*="/setting"]'
    ) as HTMLElement | null;
    if (element) {
      element.setAttribute('data-tour', 'settings-button');
    }
  }

  return element;
}

export function isElementReady(element: HTMLElement | null): boolean {
  if (
    !element ||
    !(element instanceof HTMLElement) ||
    typeof element.getBoundingClientRect !== 'function'
  ) {
    return false;
  }

  try {
    const rect = element.getBoundingClientRect();
    // For disabled buttons (like complete-onboarding-button), they might have reduced opacity
    // but should still be considered "ready" if they exist in the DOM
    const isDisabledButton =
      element.hasAttribute('disabled') ||
      element.classList.contains('cursor-not-allowed') ||
      element.getAttribute('data-tour') === 'complete-onboarding-button';

    // If it's a disabled button, just check if it exists and has some dimensions
    if (isDisabledButton) {
      return rect.width >= 0 && rect.height >= 0;
    }

    return rect.width > 0 && rect.height > 0;
  } catch (error) {
    console.warn('[Tour] Error checking element readiness:', error);
    return false;
  }
}

export function isElementInViewport(element: HTMLElement | null): boolean {
  if (
    !element ||
    !(element instanceof HTMLElement) ||
    typeof element.getBoundingClientRect !== 'function'
  ) {
    return false;
  }

  try {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  } catch (error) {
    console.warn('[Tour] Error checking element viewport:', error);
    return false;
  }
}
