import {
  findElementByTourAttribute,
  findSettingsButton,
  isElementReady,
  isElementInViewport,
} from "./elementChecker";
import { openSidebarIfNeeded } from "./stepHandlers";
import type { TourType } from "../types/tour";

export interface StepPreparationOptions {
  index: number;
  targetSelector: string;
  tourType: TourType;
  setIsWaitingForStep: (waiting: boolean) => void;
  pendingStepRef: React.MutableRefObject<number | null>;
  handleStepChange: (index: number) => void;
}

export function prepareStepBefore(options: StepPreparationOptions): boolean {
  const {
    index,
    targetSelector,
    tourType,
    setIsWaitingForStep,
    pendingStepRef,
    handleStepChange,
  } = options;

  // For welcome section, ensure it stays at the top and visible
  if (targetSelector.includes("welcome-section")) {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (tourType === "onboarding") {
      // Allow scrolling during onboarding tour
      document.body.style.overflow = "";
    }
    return false; // Don't pause
  }

  // Extract tour attribute from selector
  const tourAttribute = targetSelector.match(/data-tour="([^"]+)"/)?.[1];
  if (!tourAttribute) return false;

  const isSidebarElement = tourAttribute === "settings-button";

  // Special handling for settings-button (sidebar element)
  if (isSidebarElement) {
    const opened = openSidebarIfNeeded(tourType);
    if (opened) {
      // Wait for sidebar to open
      let retries = 0;
      const maxRetries = 20;
      setIsWaitingForStep(true);
      pendingStepRef.current = index;

      const retryInterval = setInterval(() => {
        retries++;
        const element = findSettingsButton();

        if (element && isElementReady(element)) {
          clearInterval(retryInterval);
          setIsWaitingForStep(false);
          if (pendingStepRef.current !== null) {
            handleStepChange(pendingStepRef.current);
            pendingStepRef.current = null;
          }
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          setIsWaitingForStep(false);
          pendingStepRef.current = null;
        }
      }, 100);
      return true; // Pause tour
    }

    // Verify element exists
    let element = findSettingsButton();
    if (!element) {
      // Retry finding
      setIsWaitingForStep(true);
      pendingStepRef.current = index;
      let retries = 0;
      const maxRetries = 30;

      const retryInterval = setInterval(() => {
        retries++;
        element = findSettingsButton();

        if (element && isElementReady(element)) {
          clearInterval(retryInterval);
          setIsWaitingForStep(false);
          if (pendingStepRef.current !== null) {
            handleStepChange(pendingStepRef.current);
            pendingStepRef.current = null;
          }
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          setIsWaitingForStep(false);
          pendingStepRef.current = null;
        }
      }, 100);
      return true; // Pause tour
    }

    // Element found, verify ready
    if (!isElementReady(element)) {
      setIsWaitingForStep(true);
      pendingStepRef.current = index;
      setTimeout(() => {
        const retryElement = findSettingsButton();
        if (retryElement && isElementReady(retryElement)) {
          setIsWaitingForStep(false);
          if (pendingStepRef.current !== null) {
            handleStepChange(pendingStepRef.current);
            pendingStepRef.current = null;
          }
        } else {
          setIsWaitingForStep(false);
          pendingStepRef.current = null;
        }
      }, 200);
      return true; // Pause tour
    }
    return false; // Don't pause
  }

  // Handle reports-table with special scrolling
  if (tourAttribute === "reports-table") {
    let element = findElementByTourAttribute(tourAttribute);

    if (!element) {
      setIsWaitingForStep(true);
      pendingStepRef.current = index;
      let retries = 0;
      const maxRetries = 30;

      const retryInterval = setInterval(() => {
        retries++;
        element = findElementByTourAttribute(tourAttribute);

        if (element && isElementReady(element)) {
          clearInterval(retryInterval);
          element.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "nearest",
          });
          setTimeout(() => {
            setIsWaitingForStep(false);
            if (pendingStepRef.current !== null) {
              handleStepChange(pendingStepRef.current);
              pendingStepRef.current = null;
            }
          }, 300);
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          setIsWaitingForStep(false);
          pendingStepRef.current = null;
        }
      }, 100);
      return true; // Pause tour
    }

    if (
      element &&
      (!isElementInViewport(element) || !isElementReady(element))
    ) {
      element.scrollIntoView({
        behavior: "instant",
        block: "center",
        inline: "nearest",
      });
      setIsWaitingForStep(true);
      pendingStepRef.current = index;
      setTimeout(() => {
        setIsWaitingForStep(false);
        if (pendingStepRef.current !== null) {
          handleStepChange(pendingStepRef.current);
          pendingStepRef.current = null;
        }
      }, 200);
      return true; // Pause tour
    }
    return false; // Don't pause
  }

  // Generic handling for other elements
  let element = findElementByTourAttribute(tourAttribute);

  // Special handling for complete-onboarding-button - it might be disabled but still exists
  const isCompleteButton = tourAttribute === "complete-onboarding-button";

  if (!element) {
    setIsWaitingForStep(true);
    pendingStepRef.current = index;
    let retries = 0;
    const maxRetries = isCompleteButton ? 100 : 30; // Many more retries for complete button (10 seconds)

    const retryInterval = setInterval(() => {
      retries++;

      // Try multiple ways to find the complete button
      if (isCompleteButton) {
        // Method 1: Direct data-tour attribute
        element = document.querySelector(
          `[data-tour="complete-onboarding-button"]`,
        ) as HTMLElement | null;

        // Method 2: Find by button text
        if (!element) {
          const buttons = Array.from(
            document.querySelectorAll("button"),
          ) as HTMLElement[];
          element =
            buttons.find((btn) => {
              const text =
                btn.textContent || btn.querySelector("span")?.textContent || "";
              return text.includes("Complete Onboarding");
            }) || null;

          // If found, add the data-tour attribute
          if (element && !element.hasAttribute("data-tour")) {
            element.setAttribute("data-tour", "complete-onboarding-button");
            console.log(
              "[Tour] Found complete button by text, added data-tour attribute",
            );
          }
        }

        // Method 3: Find by class or parent structure
        if (!element) {
          const containers = Array.from(
            document.querySelectorAll("div.flex.justify-end"),
          ) as HTMLElement[];
          for (const container of containers) {
            const btn = container.querySelector("button");
            if (
              btn &&
              (btn.textContent?.includes("Complete") ||
                btn.querySelector("span")?.textContent?.includes("Complete"))
            ) {
              element = btn as HTMLElement;
              element.setAttribute("data-tour", "complete-onboarding-button");
              console.log(
                "[Tour] Found complete button by container structure, added data-tour attribute",
              );
              break;
            }
          }
        }
      } else {
        element = findElementByTourAttribute(tourAttribute);
      }

      if (element) {
        // For complete button, check if it exists (even if disabled)
        // For other elements, check if ready
        const isReady = isCompleteButton ? true : isElementReady(element);

        if (isReady) {
          clearInterval(retryInterval);
          console.log(
            `[Tour] Found element ${tourAttribute} after ${retries} retries`,
          );
          // Don't scroll for complete button - let it stay at bottom
          if (!isCompleteButton) {
            element.scrollIntoView({
              behavior: "instant",
              block: "center",
              inline: "nearest",
            });
          }
          setTimeout(
            () => {
              setIsWaitingForStep(false);
              if (pendingStepRef.current !== null) {
                handleStepChange(pendingStepRef.current);
                pendingStepRef.current = null;
              }
            },
            isCompleteButton ? 1000 : 500,
          );
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          console.warn(
            `[Tour] Element ${tourAttribute} found but not ready after ${retries} retries`,
          );
          setIsWaitingForStep(false);
          pendingStepRef.current = null;
        }
      } else if (retries >= maxRetries) {
        clearInterval(retryInterval);
        console.error(
          `[Tour] Element ${tourAttribute} not found after ${retries} retries`,
        );
        setIsWaitingForStep(false);
        pendingStepRef.current = null;
      }
    }, 100);
    return true; // Pause tour
  }

  // Element found, verify ready (skip readiness check for complete button if disabled)
  if (!isCompleteButton && !isElementReady(element)) {
    setIsWaitingForStep(true);
    pendingStepRef.current = index;
    setTimeout(() => {
      const retryElement = findElementByTourAttribute(tourAttribute);
      if (retryElement && isElementReady(retryElement)) {
        retryElement.scrollIntoView({
          behavior: "instant",
          block: "center",
          inline: "nearest",
        });
        setIsWaitingForStep(false);
        pendingStepRef.current = null;
      } else {
        setIsWaitingForStep(false);
        pendingStepRef.current = null;
      }
    }, 200);
    return true; // Pause tour
  }

  // Ensure element exists before using it
  if (!element) {
    return false; // Don't pause if element not found
  }

  // For dashboard tours, scroll if needed
  if (tourType === "dashboard" && !isSidebarElement) {
    if (!isElementInViewport(element)) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      setTimeout(() => {
        if (element) {
          void element.offsetHeight;
          void element.getBoundingClientRect();
        }
      }, 300);
    }
  } else if (tourType === "onboarding") {
    // For complete button, scroll to it but don't force center (let it stay at bottom)
    if (tourAttribute === "complete-onboarding-button") {
      if (!isElementInViewport(element)) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    } else if (!isElementInViewport(element)) {
      element.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      });
    }
  }

  // Force reflows for stable positioning
  if (element) {
    void element.offsetHeight;
    void element.getBoundingClientRect();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (element) {
          void element.offsetHeight;
          void element.getBoundingClientRect();
        }
      });
    });
  }

  return false; // Don't pause
}
