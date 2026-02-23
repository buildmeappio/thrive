"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Joyride, { CallBackProps } from "react-joyride";
import { useTour } from "../hooks/useTour";
import type { TourWrapperProps } from "../types/tourWrapper";
import { joyrideStyles, tourGlobalStyles } from "../styles/tourStyles";
import { checkTourElements } from "../utils/elementChecker";
import { handleJoyrideCallback } from "../utils/callbackHandler";
import { createPopperHandler } from "../utils/popperHandler";

export function TourWrapper({
  steps,
  tourType,
  examinerProfileId,
  autoStart = false,
  tourProgress,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
}: TourWrapperProps) {
  const {
    isRunning,
    stepIndex: _stepIndex,
    startTour: _startTour,
    stopTour,
    handleTourComplete,
    handleTourSkip,
    handleStepChange,
  } = useTour({
    tourType,
    examinerProfileId,
    autoStart,
    tourProgress,
  });

  const [isWaitingForStep, setIsWaitingForStep] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pendingStepRef = useRef<number | null>(null);
  const currentStepIndexRef = useRef<number>(0);
  const [_elementsReady, setElementsReady] = useState(tourType !== "dashboard");

  // Debug: Log when isRunning changes
  useEffect(() => {
    if (tourType === "dashboard") {
      console.log("[Tour] TourWrapper - isRunning changed:", {
        isRunning,
        isWaitingForStep,
        runProp: isRunning && !isWaitingForStep,
        stepsLength: steps.length,
      });
    }
  }, [isRunning, isWaitingForStep, tourType, steps.length]);

  // Verify all tour elements exist and are visible before allowing tour to run
  useEffect(() => {
    if (tourType !== "dashboard") {
      setElementsReady(true);
      return;
    }

    checkTourElements(tourType).then((result) => {
      setElementsReady(result.allFound);
    });
  }, [tourType]);

  // Track client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add global CSS styles
  useEffect(() => {
    if (!isMounted) return;
    const style = document.createElement("style");
    style.textContent = tourGlobalStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [isMounted]);

  // Ensure scroll is always unlocked when tour is not running
  useEffect(() => {
    if (!isRunning) {
      // Unlock scroll when tour is not running
      document.body.style.overflow = "";
      // Also remove any inline styles that might prevent scrolling
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    }
    // Cleanup: ensure scroll is unlocked on unmount
    return () => {
      document.body.style.overflow = "";
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, [isRunning]);

  // Additional cleanup: ensure scroll is always enabled after tour finishes
  useEffect(() => {
    if (!isRunning) {
      // Use multiple methods to ensure scrolling is restored
      const restoreScroll = () => {
        document.body.style.overflow = "";
        document.body.style.overflowX = "";
        document.body.style.overflowY = "";
        // Also check and remove any CSS classes that might prevent scrolling
        document.body.classList.remove("overflow-hidden");
      };

      // Restore immediately
      restoreScroll();

      // Also restore after a delay to catch any async operations
      const timeout1 = setTimeout(restoreScroll, 100);
      const timeout2 = setTimeout(restoreScroll, 500);
      const timeout3 = setTimeout(restoreScroll, 1000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        restoreScroll();
      };
    }
  }, [isRunning]);

  // Create callback handler
  const handleCallback = useCallback(
    (data: CallBackProps) => {
      handleJoyrideCallback({
        data,
        tourType,
        steps,
        currentStepIndexRef,
        setIsWaitingForStep,
        pendingStepRef,
        handleTourComplete,
        handleTourSkip,
        stopTour,
        handleStepChange,
      });
    },
    [
      tourType,
      steps,
      handleTourComplete,
      handleTourSkip,
      stopTour,
      handleStepChange,
    ],
  );

  // Create popper handler
  const getPopper = useCallback(
    (popper: any, origin: "floater" | "wrapper") => {
      createPopperHandler({
        popper,
        origin,
        currentStepIndexRef,
        steps,
        tourType,
      });
    },
    [steps, tourType],
  );

  // Custom target resolver to handle disabled buttons - must be before early returns
  const getTarget = useCallback(
    (target: string | HTMLElement | (() => HTMLElement)): HTMLElement => {
      // Handle different input types
      let targetString = "";
      if (typeof target === "string") {
        targetString = target;
      } else if (typeof target === "function") {
        const result = target();
        if (result && result instanceof HTMLElement) {
          return result;
        }
        // If function returns invalid result, try to extract selector from step
        return document.body; // Fallback
      } else if (target instanceof HTMLElement) {
        return target;
      } else {
        return document.body; // Fallback
      }

      // For complete-onboarding-button, try multiple methods
      if (targetString.includes("complete-onboarding-button")) {
        // Method 1: Try wrapper div first (more reliable)
        let element = document.querySelector(
          '[data-tour="complete-onboarding-button"]',
        ) as HTMLElement | null;

        // Method 2: Try button directly
        if (!element) {
          element = document.querySelector(
            'button[data-tour="complete-onboarding-button"]',
          ) as HTMLElement | null;
        }

        // Method 3: Find by text
        if (!element) {
          const buttons = Array.from(
            document.querySelectorAll("button"),
          ) as HTMLElement[];
          const buttonElement = buttons.find((btn) => {
            const text =
              btn.textContent || btn.querySelector("span")?.textContent || "";
            return text.includes("Complete Onboarding");
          });

          if (buttonElement && buttonElement instanceof HTMLElement) {
            // Find parent wrapper or use parent
            let wrapper = buttonElement.closest(
              '[data-tour="complete-onboarding-button"]',
            ) as HTMLElement | null;
            if (!wrapper && buttonElement.parentElement) {
              buttonElement.parentElement.setAttribute(
                "data-tour",
                "complete-onboarding-button",
              );
              wrapper = buttonElement.parentElement;
            }
            element = wrapper || buttonElement;
          }
        }

        if (element && element instanceof HTMLElement) {
          console.log("[Tour] Found complete button element:", element);
          return element;
        }
      }

      // Default behavior for other targets
      const defaultElement = document.querySelector(
        targetString,
      ) as HTMLElement | null;
      if (!defaultElement || !(defaultElement instanceof HTMLElement)) {
        // Return a dummy element if not found (will trigger error handler)
        const dummy = document.createElement("div");
        dummy.style.display = "none";
        const tourAttr =
          targetString.match(/data-tour="([^"]+)"/)?.[1] || "unknown";
        dummy.setAttribute("data-tour", tourAttr);
        document.body.appendChild(dummy);
        return dummy;
      }
      return defaultElement;
    },
    [],
  );

  // Debug: Log before rendering
  useEffect(() => {
    if (tourType === "dashboard") {
      console.log("[Tour] TourWrapper render check:", {
        stepsLength: steps.length,
        isRunning,
        isWaitingForStep,
      });
    }
  });

  if (steps.length === 0) {
    console.warn("[Tour] No steps provided!");
    return null;
  }

  // Don't render Joyride during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  const runValue = isRunning && !isWaitingForStep;

  // Debug logging for dashboard tours
  if (tourType === "dashboard") {
    console.log("[Tour] Joyride render:", {
      run: runValue,
      isRunning,
      isWaitingForStep,
      stepsLength: steps.length,
      tourType,
    });
  }

  // Transform steps to use custom target resolver for complete button
  const transformedSteps = steps.map((step) => {
    if (
      step.target &&
      typeof step.target === "string" &&
      step.target.includes("complete-onboarding-button")
    ) {
      // Use function target to dynamically find the element
      return {
        ...step,
        target: (() => {
          try {
            const element = getTarget(step.target as string);
            // Ensure it's a valid HTMLElement
            if (
              element &&
              element instanceof HTMLElement &&
              typeof element.getBoundingClientRect === "function"
            ) {
              return element;
            }
            // Fallback: try to find it again
            const found = document.querySelector(
              '[data-tour="complete-onboarding-button"]',
            ) as HTMLElement;
            if (found && found instanceof HTMLElement) {
              return found;
            }
            return document.body; // Last resort fallback
          } catch (error) {
            console.error("[Tour] Error getting target:", error);
            return document.body;
          }
        }) as any,
      };
    }
    return step;
  });

  return (
    <Joyride
      key={`joyride-${tourType}`}
      steps={transformedSteps as any}
      run={runValue}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={handleCallback}
      styles={joyrideStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
      floaterProps={{
        disableAnimation: true,
        disableFlip: true,
        hideArrow: false,
        offset: 10,
        options: {
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                rootBoundary: "viewport",
                altAxis: true,
                padding: 8,
              },
            },
            {
              name: "flip",
              enabled: false,
              options: {
                fallbackPlacements: [],
              },
            },
            {
              name: "computeStyles",
              options: {
                adaptive: false,
                gpuAcceleration: false,
              },
            },
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
          ],
        },
        styles: {
          floater: {
            filter: "none",
            transition: "none",
          },
          floaterWithAnimation: {
            filter: "none",
            transition: "none",
          },
          arrow: {
            length: 8,
            spread: 16,
          },
        },
        getPopper,
      }}
      scrollToFirstStep={true}
      scrollOffset={100}
      spotlightClicks={false}
      disableOverlayClose={true}
      disableScrolling={false}
      disableCloseOnEsc={true}
      hideCloseButton={true}
      disableScrollParentFix={true}
    />
  );
}
