import React from 'react';
import type { Step } from 'react-joyride';
import {
  findElementByTourAttribute,
  findSettingsButton,
  isElementInViewport,
  isElementReady,
} from './elementChecker';
import type { TourType } from '../types/tour';

export interface PopperHandlerOptions {
  popper: any;
  origin: 'floater' | 'wrapper';
  currentStepIndexRef: React.MutableRefObject<number>;
  steps: Step[];
  tourType: TourType;
}

export function createPopperHandler(options: PopperHandlerOptions) {
  const { popper, origin, currentStepIndexRef, steps, tourType } = options;

  if (origin !== 'floater' || !popper) {
    return;
  }

  let currentIndex = currentStepIndexRef.current;

  // Special handling for reports-table step (step 3, index 2)
  if (popper?.state?.elements?.reference) {
    const referenceElement = popper.state.elements.reference;
    const tourAttr = referenceElement?.getAttribute?.('data-tour');

    if (tourAttr === 'reports-table') {
      currentIndex = 2;
      const targetElement = findElementByTourAttribute('reports-table');

      if (
        targetElement &&
        targetElement instanceof HTMLElement &&
        typeof targetElement.getBoundingClientRect === 'function' &&
        popper.state
      ) {
        try {
          const rect = targetElement.getBoundingClientRect();
          if (
            rect.top < 0 ||
            rect.bottom > window.innerHeight ||
            rect.width === 0 ||
            rect.height === 0
          ) {
            targetElement.scrollIntoView({
              behavior: 'instant',
              block: 'center',
              inline: 'nearest',
            });
            void targetElement.offsetHeight;
            if (typeof targetElement.getBoundingClientRect === 'function') {
              void targetElement.getBoundingClientRect();
            }
          }
        } catch (error) {
          console.warn('[Tour] Error handling reports-table positioning:', error);
        }

        // Add custom offset modifier
        if (!popper.state.modifiers) {
          popper.state.modifiers = [];
        }

        let offsetModifier = popper.state.modifiers.find((m: any) => m.name === 'offset');

        if (!offsetModifier) {
          offsetModifier = {
            name: 'offset',
            enabled: true,
            options: { offset: [0, 10] },
          };
          popper.state.modifiers.push(offsetModifier);
        } else {
          offsetModifier.options = { offset: [0, 10] };
        }

        if (popper.forceUpdate) {
          popper.forceUpdate();
        }
      }
    }
  }

  // Find current step from popper reference
  let foundStep = false;
  if (popper?.state?.elements?.reference) {
    const referenceElement = popper.state.elements.reference;

    if (tourType === 'dashboard') {
      console.log(
        `[Tour] getPopper: Checking reference element:`,
        referenceElement,
        `tagName: ${referenceElement.tagName}, id: ${referenceElement.id}, classes: ${referenceElement.className}`,
        `data-tour: ${referenceElement.getAttribute?.('data-tour')}`
      );
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step?.target) {
        const targetSelector = step.target as string;
        const tourAttribute = targetSelector.match(/data-tour="([^"]+)"/)?.[1];

        if (tourAttribute) {
          const targetElement = findElementByTourAttribute(tourAttribute);
          let isMatch = false;

          if (targetElement) {
            if (referenceElement === targetElement) {
              isMatch = true;
            } else if (referenceElement.contains && referenceElement.contains(targetElement)) {
              isMatch = true;
            } else if (targetElement.contains && targetElement.contains(referenceElement)) {
              isMatch = true;
            } else if (referenceElement.closest) {
              const closest = referenceElement.closest(`[data-tour="${tourAttribute}"]`);
              if (closest === targetElement) {
                isMatch = true;
              }
            } else if (
              referenceElement.getAttribute &&
              referenceElement.getAttribute('data-tour') === tourAttribute
            ) {
              isMatch = true;
            }
          }

          if (isMatch) {
            currentIndex = i;
            foundStep = true;
            if (tourType === 'dashboard') {
              console.log(
                `[Tour] getPopper: Found step ${i} (${tourAttribute}) from popper reference element`
              );
            }
            break;
          }
        }
      }
    }
  }

  // Fallback: Check spotlight position
  if (!foundStep) {
    const spotlightElement = document.querySelector('.react-joyride__spotlight') as HTMLElement;

    if (
      spotlightElement &&
      spotlightElement instanceof HTMLElement &&
      typeof spotlightElement.getBoundingClientRect === 'function'
    ) {
      if (tourType === 'dashboard') {
        console.log(`[Tour] getPopper: Spotlight element found, checking for highlighted element`);
      }

      try {
        const spotlightRect = spotlightElement.getBoundingClientRect();
        const allTourElements = document.querySelectorAll('[data-tour]');

        for (const tourElement of allTourElements) {
          if (
            !(tourElement instanceof HTMLElement) ||
            typeof tourElement.getBoundingClientRect !== 'function'
          ) {
            continue;
          }
          const elementRect = tourElement.getBoundingClientRect();
          const isNearby =
            Math.abs(spotlightRect.left - elementRect.left) < 50 &&
            Math.abs(spotlightRect.top - elementRect.top) < 50 &&
            Math.abs(spotlightRect.width - elementRect.width) < 50 &&
            Math.abs(spotlightRect.height - elementRect.height) < 50;

          if (isNearby) {
            const tourAttribute = (tourElement as HTMLElement).getAttribute('data-tour');

            for (let i = 0; i < steps.length; i++) {
              const step = steps[i];
              if (step?.target) {
                const targetSelector = step.target as string;
                const stepTourAttribute = targetSelector.match(/data-tour="([^"]+)"/)?.[1];

                if (stepTourAttribute === tourAttribute) {
                  currentIndex = i;
                  foundStep = true;
                  if (tourType === 'dashboard') {
                    console.log(
                      `[Tour] getPopper: Found step ${i} (${tourAttribute}) from spotlight position`
                    );
                  }
                  break;
                }
              }
            }

            if (foundStep) break;
          }
        }
      } catch (error) {
        console.warn('[Tour] Error in spotlight element matching:', error);
      }
    }
  }

  if (!foundStep && tourType === 'dashboard') {
    console.log(
      `[Tour] getPopper: Could not find step from popper/spotlight, using ref value: ${currentIndex}`
    );
  }

  const currentStep = steps[currentIndex];

  if (tourType === 'dashboard') {
    console.log(
      `[Tour] getPopper processing: origin=${origin}, stepIndex=${currentIndex}, hasStep=${!!currentStep}, stepTarget=${currentStep?.target}`
    );
  }

  // Special handling for settings-button step
  if (
    currentIndex === 5 &&
    typeof currentStep?.target === 'string' &&
    currentStep?.target?.includes('settings-button')
  ) {
    const targetElement = findSettingsButton();

    if (
      targetElement &&
      targetElement instanceof HTMLElement &&
      typeof targetElement.getBoundingClientRect === 'function' &&
      popper?.state?.styles?.popper
    ) {
      try {
        const elementRect = targetElement.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 120;

        const desiredLeft = elementRect.right + 15;
        const desiredTop = elementRect.top + elementRect.height / 2 - tooltipHeight / 2;

        const adjustedLeft =
          desiredLeft + tooltipWidth > window.innerWidth
            ? elementRect.left - tooltipWidth - 15
            : desiredLeft;
        const adjustedTop = Math.max(
          10,
          Math.min(desiredTop, window.innerHeight - tooltipHeight - 10)
        );

        popper.state.styles.popper.position = 'fixed';
        popper.state.styles.popper.left = `${adjustedLeft}px`;
        popper.state.styles.popper.top = `${adjustedTop}px`;
        popper.state.styles.popper.transform = 'none';
        popper.state.styles.popper.margin = '0';

        if (tourType === 'dashboard') {
          console.log('[Tour] getPopper: Custom positioning for settings-button:', {
            elementRect,
            position: { left: adjustedLeft, top: adjustedTop },
          });
        }
      } catch (error) {
        console.warn('[Tour] Error handling settings-button positioning:', error);
      }
    }
  }

  // Special handling for complete-onboarding-button step (onboarding tour, step index 8)
  // Check both by step index and target selector to ensure we catch it
  const isCompleteOnboardingStep =
    tourType === 'onboarding' &&
    (currentIndex === 8 ||
      (typeof currentStep?.target === 'string' &&
        currentStep?.target?.includes('complete-onboarding-button')));

  if (isCompleteOnboardingStep) {
    const targetElement = findElementByTourAttribute('complete-onboarding-button');

    if (
      targetElement &&
      targetElement instanceof HTMLElement &&
      typeof targetElement.getBoundingClientRect === 'function'
    ) {
      try {
        // Ensure element is in viewport
        const elementRect = targetElement.getBoundingClientRect();
        if (
          elementRect.top < 0 ||
          elementRect.bottom > window.innerHeight ||
          elementRect.width === 0 ||
          elementRect.height === 0
        ) {
          targetElement.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'nearest',
          });
          // Force reflow
          void targetElement.offsetHeight;
          if (typeof targetElement.getBoundingClientRect === 'function') {
            void targetElement.getBoundingClientRect();
          }
        }

        if (popper?.state?.styles?.popper) {
          // Get updated rect after scrolling
          const updatedRect = targetElement.getBoundingClientRect();
          const tooltipWidth = 320;
          const tooltipHeight = 150; // Slightly taller to account for content

          // Position tooltip above the button (top placement)
          // Center horizontally relative to the button
          const desiredLeft = updatedRect.left + updatedRect.width / 2 - tooltipWidth / 2;
          const desiredTop = updatedRect.top - tooltipHeight - 15; // 15px gap above button

          // Ensure tooltip doesn't go off-screen horizontally
          const adjustedLeft = Math.max(
            10,
            Math.min(desiredLeft, window.innerWidth - tooltipWidth - 10)
          );

          // If tooltip would go off-screen at the top, position it below the button instead
          let adjustedTop = desiredTop;
          if (desiredTop < 10) {
            adjustedTop = updatedRect.bottom + 15; // Position below button
          } else {
            // Ensure tooltip doesn't go off-screen at the top
            adjustedTop = Math.max(10, desiredTop);
          }

          // Ensure tooltip doesn't go off-screen at the bottom
          adjustedTop = Math.min(adjustedTop, window.innerHeight - tooltipHeight - 10);

          popper.state.styles.popper.position = 'fixed';
          popper.state.styles.popper.left = `${adjustedLeft}px`;
          popper.state.styles.popper.top = `${adjustedTop}px`;
          popper.state.styles.popper.transform = 'none';
          popper.state.styles.popper.margin = '0';

          console.log('[Tour] getPopper: Custom positioning for complete-onboarding-button:', {
            currentIndex,
            elementRect: updatedRect,
            position: { left: adjustedLeft, top: adjustedTop },
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          });
        }
      } catch (error) {
        console.warn('[Tour] Error handling complete-onboarding-button positioning:', error);
      }
    }
  }

  // Verify element readiness for critical steps
  if (currentStep?.target) {
    const targetSelector = currentStep.target as string;
    const tourAttribute = targetSelector.match(/data-tour="([^"]+)"/)?.[1];

    const needsExtraCare =
      currentIndex >= 2 &&
      currentIndex <= 5 &&
      (tourAttribute === 'reports-table' ||
        tourAttribute === 'recent-updates' ||
        tourAttribute === 'summary-panel' ||
        tourAttribute === 'settings-button');

    if (needsExtraCare && tourAttribute) {
      console.log(`[Tour] getPopper: Verifying element ${tourAttribute} for step ${currentIndex}`);
      const element = findElementByTourAttribute(tourAttribute);

      if (
        element &&
        element instanceof HTMLElement &&
        typeof element.getBoundingClientRect === 'function'
      ) {
        try {
          const rect = element.getBoundingClientRect();
          const isInViewport = isElementInViewport(element);
          const isReady = isElementReady(element);

          console.log(
            `[Tour] getPopper: Element ${tourAttribute} - inViewport: ${isInViewport}, dimensions: ${rect.width}x${rect.height}, position: (${rect.left}, ${rect.top}), viewport: ${window.innerWidth}x${window.innerHeight}`
          );

          if (!isInViewport || !isReady) {
            console.log(
              `[Tour] getPopper: Element ${tourAttribute} not ready, scrolling into view`
            );
            if (tourAttribute !== 'settings-button') {
              element.scrollIntoView({
                behavior: 'instant',
                block: 'center',
                inline: 'nearest',
              });
            }
            void element.offsetHeight;
            if (typeof element.getBoundingClientRect === 'function') {
              void element.getBoundingClientRect();
            }
          }
        } catch (error) {
          console.warn(`[Tour] Error verifying element ${tourAttribute}:`, error);
        }
      } else {
        console.warn(`[Tour] getPopper: Element ${tourAttribute} not found in DOM or invalid`);
      }
    }
  }

  // Schedule popper updates
  const updatePopper = () => {
    if (popper?.update) {
      try {
        popper.update();
      } catch {
        // Ignore popper update errors
      }
    }
  };

  updatePopper();
  const intervals = [5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 400, 500, 600, 800, 1000];
  intervals.forEach(delay => setTimeout(updatePopper, delay));
}
