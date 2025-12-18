"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTour } from "../hooks/useTour";
import type { TourType } from "../types/tour";

interface TourWrapperProps {
  steps: Step[];
  tourType: TourType;
  examinerProfileId: string;
  autoStart?: boolean;
  tourProgress?: {
    onboardingTourCompleted: boolean;
    dashboardTourCompleted: boolean;
    onboardingTourSkipped: boolean;
    dashboardTourSkipped: boolean;
  } | null;
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
}

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
    stepIndex,
    startTour,
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
  const pendingStepRef = useRef<number | null>(null);
  const currentStepIndexRef = useRef<number>(0);
  const [elementsReady, setElementsReady] = useState(tourType !== "dashboard");

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
    // For non-dashboard tours, elements are always ready
    if (tourType !== "dashboard") {
      setElementsReady(true);
      return;
    }

    // For dashboard tours, check elements on mount and keep checking until found
    let retryCount = 0;
    const maxRetries = 50; // 10 seconds max (50 * 200ms)

    const checkElements = () => {
      retryCount++;
      const requiredElements = [
        "new-case-offers",
        "upcoming-appointments",
        "reports-table",
        "recent-updates",
        "summary-panel",
        "settings-button",
      ];

      const foundElements: string[] = [];
      const missingElements: string[] = [];

      requiredElements.forEach((attr) => {
        const element = document.querySelector(
          `[data-tour="${attr}"]`
        ) as HTMLElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            foundElements.push(attr);
          } else {
            missingElements.push(`${attr} (no dimensions)`);
          }
        } else {
          missingElements.push(attr);
        }
      });

      if (missingElements.length === 0) {
        console.log("[Tour] All dashboard elements found:", foundElements);
        setElementsReady(true);
      } else if (retryCount >= maxRetries) {
        console.warn(
          "[Tour] Some elements not found after max retries:",
          missingElements
        );
        // Set to true anyway to allow tour to start - react-joyride will handle missing elements
        setElementsReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkElements, 200);
      }
    };

    // Start checking after a delay to allow DOM to render
    const timer = setTimeout(checkElements, 100);
    return () => clearTimeout(timer);
  }, [tourType]);

  // Map tour data attributes to step IDs
  const getStepIdFromTourAttribute = (tourAttribute: string): string | null => {
    const stepMap: Record<string, string> = {
      "step-profile-info": "profile",
      "step-services-assessment": "services",
      "step-availability": "availability",
      "step-payout": "payout",
      "step-documents": "documents",
      "step-compliance": "compliance",
      "step-notifications": "notifications",
    };
    return stepMap[tourAttribute] || null;
  };

  // Helper function to handle step button click
  const handleStepButtonClick = useCallback(
    (stepContainer: HTMLElement, stepIndex: number) => {
      // Find the button inside the container
      const stepButton = stepContainer.querySelector("button") as HTMLElement;
      if (!stepButton) return;

      // Check if step is already open
      // When a step is open, the form appears as a sibling div after the button within the same parent
      const buttonParent = stepButton.parentElement; // This is the div with data-tour attribute

      // Check if there's a form/component div as a sibling after the button (step is open)
      let isStepOpen = false;
      if (buttonParent) {
        // The form is rendered as: {step.id === activeStep && <div>{renderStepForm(step.id)}</div>}
        // So it's a direct child div of buttonParent, after the button
        const allChildren = Array.from(buttonParent.children);
        const buttonIndex = allChildren.indexOf(stepButton);

        // Check if there's a div after the button that contains form content
        for (let i = buttonIndex + 1; i < allChildren.length; i++) {
          const sibling = allChildren[i];
          if (sibling.tagName === "DIV") {
            // Check if this div contains form elements
            const hasForm =
              sibling.querySelector(
                'form, [class*="Form"], [class*="MultipleFileUploadInput"], [class*="bg-white rounded-2xl"], [class*="rounded-2xl p-6"]'
              ) !== null;
            if (hasForm) {
              isStepOpen = true;
              break;
            }
          }
        }
      }

      if (!isStepOpen) {
        // Step is not open, click to open it
        setIsWaitingForStep(true);
        pendingStepRef.current = stepIndex;

        // Scroll the button into view first
        stepButton.scrollIntoView({ behavior: "smooth", block: "center" });

        // Click the button to open the step
        setTimeout(() => {
          stepButton.click();

          // Wait for the step to expand, then continue the tour
          setTimeout(() => {
            setIsWaitingForStep(false);
            // Re-enable scrolling now that step is open
            document.body.style.overflow = "";
            // Force the tour to show the step now that it's open
            if (pendingStepRef.current !== null) {
              // Use a small delay to ensure DOM is updated
              setTimeout(() => {
                handleStepChange(pendingStepRef.current!);
                pendingStepRef.current = null;
              }, 300);
            }
          }, 800);
        }, 300);
      } else {
        // Step is already open, enable scrolling and ensure it's visible
        document.body.style.overflow = "";
        stepButton.scrollIntoView({ behavior: "smooth", block: "center" });
        // Don't pause the tour if step is already open - let it continue
        setIsWaitingForStep(false);
      }
    },
    [handleStepChange]
  );

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index, action, step } = data;

      // Update current step index ref for getPopper
      if (index !== undefined) {
        currentStepIndexRef.current = index;
      }

      // Log all callbacks for debugging
      if (tourType === "dashboard") {
        console.log("[Tour] Joyride callback:", {
          type,
          status,
          index,
          action,
          stepTarget: step?.target,
        });
      }

      // For dashboard tour, always allow scrolling
      if (tourType === "dashboard") {
        document.body.style.overflow = "";
      }

      // Handle tour completion or skip
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        if (status === STATUS.FINISHED) {
          handleTourComplete();
        } else {
          handleTourSkip();
        }
        stopTour();
        setIsWaitingForStep(false);
        pendingStepRef.current = null;
        return;
      }

      // Handle "Next" button clicks - ensure tour progresses
      if (action === "next" || action === "prev") {
        // Clear any waiting state to prevent blocking progression
        setIsWaitingForStep(false);
        pendingStepRef.current = null;

        // Let react-joyride handle the progression naturally
        // Don't call handleStepChange here as it might interfere with react-joyride's internal state
      }

      // Before showing a step, check if we need to open/expand it
      if (type === "step:before" && step?.target) {
        const targetSelector = step.target as string;

        // For welcome section, ensure it stays at the top and visible
        if (targetSelector.includes("welcome-section")) {
          // Ensure page is at top and lock scroll temporarily
          window.scrollTo({ top: 0, behavior: "instant" });
          // Lock scroll to prevent it from moving (only for onboarding)
          if (tourType === "onboarding") {
            document.body.style.overflow = "hidden";
            // Unlock after a short delay to allow tooltip positioning
            setTimeout(() => {
              document.body.style.overflow = "";
            }, 100);
          }
        }

        // For dashboard tour steps, pause tour until element is found and ready
        if (
          targetSelector.includes("reports-table") ||
          targetSelector.includes("upcoming-appointments") ||
          targetSelector.includes("new-case-offers") ||
          targetSelector.includes("recent-updates") ||
          targetSelector.includes("summary-panel") ||
          targetSelector.includes("settings-button")
        ) {
          const isSidebarElement = targetSelector.includes("settings-button");
          const tourAttribute =
            targetSelector.match(/data-tour="([^"]+)"/)?.[1];
          if (tourAttribute) {
            // Find the element
            let element = document.querySelector(
              `[data-tour="${tourAttribute}"]`
            ) as HTMLElement;

            if (!element) {
              // Element not found - pause tour and retry
              setIsWaitingForStep(true);
              pendingStepRef.current = index;

              let retries = 0;
              const maxRetries = 30;
              const retryInterval = setInterval(() => {
                retries++;
                element = document.querySelector(
                  `[data-tour="${tourAttribute}"]`
                ) as HTMLElement;

                if (element) {
                  const rect = element.getBoundingClientRect();
                  const isReady = rect.width > 0 && rect.height > 0;

                  if (isReady) {
                    clearInterval(retryInterval);
                    // Scroll into view
                    element.scrollIntoView({
                      behavior: "instant",
                      block: "center",
                      inline: "nearest",
                    });

                    // Wait for positioning, then resume
                    setTimeout(() => {
                      setIsWaitingForStep(false);
                      if (pendingStepRef.current !== null) {
                        handleStepChange(pendingStepRef.current);
                        pendingStepRef.current = null;
                      }
                    }, 500);
                  } else if (retries >= maxRetries) {
                    clearInterval(retryInterval);
                    setIsWaitingForStep(false);
                    pendingStepRef.current = null;
                  }
                } else if (retries >= maxRetries) {
                  clearInterval(retryInterval);
                  console.error(
                    `Element ${tourAttribute} not found after ${maxRetries} retries`
                  );
                  setIsWaitingForStep(false);
                  pendingStepRef.current = null;
                }
              }, 100);

              // Prevent tooltip from showing until element is ready
              return;
            } else {
              // Element found - verify it's ready
              const rect = element.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                // Element not ready - pause and wait
                setIsWaitingForStep(true);
                pendingStepRef.current = index;

                // Retry after a short delay
                setTimeout(() => {
                  const retryElement = document.querySelector(
                    `[data-tour="${tourAttribute}"]`
                  ) as HTMLElement;
                  if (retryElement) {
                    const retryRect = retryElement.getBoundingClientRect();
                    if (retryRect.width > 0 && retryRect.height > 0) {
                      // Element is now ready - scroll and continue
                      retryElement.scrollIntoView({
                        behavior: "instant",
                        block: "center",
                        inline: "nearest",
                      });
                      setIsWaitingForStep(false);
                      pendingStepRef.current = null;
                    } else {
                      // Still not ready, give up and continue
                      setIsWaitingForStep(false);
                      pendingStepRef.current = null;
                    }
                  } else {
                    setIsWaitingForStep(false);
                    pendingStepRef.current = null;
                  }
                }, 200);
                return;
              }

              // Element is ready - for steps 3-6, pause briefly to ensure element is stable
              // BEFORE react-joyride calculates tooltip position
              const isSidebarElement = tourAttribute === "settings-button";
              // Element is ready - scroll/prepare and let react-joyride continue
              // Don't pause - use getPopper to update positions continuously
              if (isSidebarElement) {
                // For sidebar elements, don't scroll (they're fixed position)
                const rect = element.getBoundingClientRect();
                console.log(
                  `[Tour] Sidebar element ${tourAttribute} positioned at:`,
                  rect,
                  `Viewport: ${window.innerHeight}x${window.innerWidth}`
                );

                // Force multiple reflows
                void element.offsetHeight;
                void element.getBoundingClientRect();
                void element.offsetHeight;
                void element.getBoundingClientRect();
              } else {
                // For dashboard tours, disable scrolling - just verify element is ready
                // Elements are already visible, so we don't need to scroll
                if (tourType === "dashboard") {
                  const rect = element.getBoundingClientRect();
                  console.log(
                    `[Tour] Element ${tourAttribute} positioned at:`,
                    rect,
                    `Viewport: ${window.innerHeight}x${window.innerWidth}`
                  );

                  // Don't scroll - just force reflows to ensure position is calculated
                } else {
                  // For onboarding tours, check if element is in viewport before scrolling
                  const rect = element.getBoundingClientRect();
                  const isInViewport =
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <=
                      (window.innerHeight ||
                        document.documentElement.clientHeight) &&
                    rect.right <=
                      (window.innerWidth ||
                        document.documentElement.clientWidth);

                  // Only scroll if element is not fully in viewport
                  if (!isInViewport) {
                    element.scrollIntoView({
                      behavior: "instant",
                      block: "start",
                      inline: "nearest",
                    });
                  }
                }

                // Force immediate reflows multiple times to ensure layout is stable
                void element.offsetHeight;
                void element.getBoundingClientRect();

                // Use requestAnimationFrame to ensure position is calculated before tooltip appears
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    void element.offsetHeight;
                    void element.getBoundingClientRect();

                    const finalRect = element.getBoundingClientRect();
                    console.log(
                      `[Tour] Element ${tourAttribute} positioned at:`,
                      finalRect,
                      `Viewport: ${window.innerHeight}x${window.innerWidth}`
                    );
                  });
                });
              }

              // Don't pause - let react-joyride continue
              // The getPopper callback will handle continuous position updates
            }
          }
        }

        // Check if this is targeting a step button (starts with "step-")
        if (targetSelector.startsWith('[data-tour="step-')) {
          const tourAttribute =
            targetSelector.match(/data-tour="([^"]+)"/)?.[1];

          if (tourAttribute) {
            // Find the step container (div with data-tour attribute)
            let stepContainer = document.querySelector(
              `[data-tour="${tourAttribute}"]`
            ) as HTMLElement;

            // If not found, wait a bit and try again (for dynamically rendered content)
            if (!stepContainer) {
              setTimeout(() => {
                stepContainer = document.querySelector(
                  `[data-tour="${tourAttribute}"]`
                ) as HTMLElement;
                if (stepContainer) {
                  handleStepButtonClick(stepContainer, index);
                } else {
                  console.warn(
                    `Step container not found for: ${tourAttribute}`
                  );
                  document.body.style.overflow = "";
                }
              }, 200);
              return;
            }

            if (stepContainer) {
              handleStepButtonClick(stepContainer, index);
              // Return early to prevent immediate tooltip display
              return;
            } else {
              console.warn(`Step container not found for: ${tourAttribute}`);
              // Enable scrolling even if container not found
              document.body.style.overflow = "";
            }
          }
        } else {
          // Not a step button
          // For dashboard tours, ensure scrolling is enabled
          if (tourType === "dashboard") {
            document.body.style.overflow = "";
          }
        }
      }

      // Handle step progression
      if (type === "step:after") {
        // Clear pending step ref when step actually completes
        if (pendingStepRef.current === index) {
          pendingStepRef.current = null;
        }

        // For dashboard tours, ensure scrolling is enabled
        if (tourType === "dashboard") {
          document.body.style.overflow = "";

          // Pre-scroll the next step's element into view IMMEDIATELY
          // This ensures the element is ready when react-joyride tries to position the tooltip
          if (index < steps.length - 1) {
            const nextStepIndex = index + 1;
            const nextStep = steps[nextStepIndex];
            if (nextStep?.target) {
              const nextTargetSelector = nextStep.target as string;
              const tourAttribute =
                nextTargetSelector.match(/data-tour="([^"]+)"/)?.[1];

              if (tourAttribute) {
                const isSidebarElement = tourAttribute === "settings-button";

                // For steps 2-5 (which become steps 3-6), pre-scroll immediately
                // Step index 2 = reports-table (step 3 in UI)
                const needsPreScroll = nextStepIndex >= 2; // Pre-scroll for steps 3, 4, 5, 6

                if (needsPreScroll) {
                  // Immediate scroll for critical steps - do it RIGHT NOW
                  const nextElement = document.querySelector(
                    `[data-tour="${tourAttribute}"]`
                  ) as HTMLElement;

                  if (nextElement) {
                    console.log(
                      `[Tour] Pre-scrolling next element: ${tourAttribute} (step ${nextStepIndex + 1})`
                    );

                    // For dashboard tours, disable pre-scrolling - elements are already visible
                    // For onboarding tours, scroll if needed
                    if (tourType === "dashboard") {
                      // Don't scroll for dashboard - just force reflows
                      console.log(
                        `[Tour] Pre-scrolling disabled for dashboard - element ${tourAttribute} should already be visible`
                      );
                    } else if (!isSidebarElement) {
                      // For onboarding tours, scroll into view with instant behavior
                      nextElement.scrollIntoView({
                        behavior: "instant",
                        block: "center",
                        inline: "nearest",
                      });
                    }

                    // Force multiple reflows to ensure position is calculated
                    void nextElement.offsetHeight;
                    void nextElement.getBoundingClientRect();
                    void nextElement.offsetHeight;
                    void nextElement.getBoundingClientRect();

                    // Additional reflows after short delays
                    setTimeout(() => {
                      void nextElement.offsetHeight;
                      void nextElement.getBoundingClientRect();
                    }, 50);
                    setTimeout(() => {
                      void nextElement.offsetHeight;
                      void nextElement.getBoundingClientRect();
                    }, 150);
                    setTimeout(() => {
                      void nextElement.offsetHeight;
                      void nextElement.getBoundingClientRect();
                    }, 300);
                  }
                } else {
                  // For steps 1-2, use smooth scroll with delay
                  setTimeout(() => {
                    const nextElement = document.querySelector(
                      `[data-tour="${tourAttribute}"]`
                    ) as HTMLElement;
                    if (nextElement) {
                      nextElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest",
                      });
                      void nextElement.offsetHeight;
                      void nextElement.getBoundingClientRect();
                    }
                  }, 200);
                }
              }
            }
          }
        }
        // Update step index to keep it in sync (for manual control when needed)
        handleStepChange(index);
      }

      // Handle errors - when target is not found, react-joyride shows tooltip in bottom-left
      if (type === "error:target_not_found") {
        const targetSelector = step?.target as string;
        const tourAttribute = targetSelector?.match(/data-tour="([^"]+)"/)?.[1];

        console.error(
          `Tour target not found for step ${index}: ${tourAttribute || targetSelector}`
        );

        // Try to find the element manually and scroll it into view
        if (tourAttribute) {
          const element = document.querySelector(
            `[data-tour="${tourAttribute}"]`
          ) as HTMLElement;
          if (element) {
            console.log(`Element found manually: ${tourAttribute}`, element);
            element.scrollIntoView({ behavior: "instant", block: "center" });
            // Try to continue to next step after a delay
            setTimeout(() => {
              if (index < steps.length - 1) {
                handleStepChange(index + 1);
              }
            }, 500);
          } else {
            console.error(`Element ${tourAttribute} does not exist in DOM`);
          }
        }
        // Enable scrolling even if target not found
        document.body.style.overflow = "";
      }
    },
    [
      handleTourComplete,
      handleTourSkip,
      stopTour,
      handleStepChange,
      steps,
      handleStepButtonClick,
      tourType,
    ]
  );

  // Custom styles to match your design system
  const joyrideStyles = {
    options: {
      primaryColor: "#00A8FF",
      textColor: "#1F2937",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      arrowColor: "#00A8FF",
      backgroundColor: "#FFFFFF",
      spotlightShadow: "0 0 15px rgba(0, 168, 255, 0.5)",
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: "12px",
      padding: "20px",
    },
    tooltipContainer: {
      textAlign: "left" as const,
    },
    tooltipTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#1F2937",
      marginBottom: "8px",
    },
    tooltipContent: {
      fontSize: "14px",
      lineHeight: "1.5",
      color: "#4B5563",
      padding: "0",
    },
    buttonNext: {
      backgroundColor: "#00A8FF",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: 500,
      color: "#FFFFFF",
      border: "none",
      cursor: "pointer",
    },
    buttonBack: {
      color: "#6B7280",
      marginRight: "10px",
      fontSize: "14px",
      fontWeight: 500,
    },
    buttonSkip: {
      color: "#6B7280",
      fontSize: "14px",
      fontWeight: 500,
    },
  };

  // Add global CSS to fix blurry text in tour tooltips and improve positioning
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .react-joyride__tooltip,
      .react-joyride__tooltip * {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
        backface-visibility: hidden !important;
      }
      .react-joyride__floater {
        filter: none !important;
        transition: none !important;
      }
      .react-joyride__floater__element {
        position: absolute !important;
        will-change: transform !important;
      }
      .react-joyride__tooltip__content,
      .react-joyride__tooltip__title {
        transform: none !important;
        will-change: auto !important;
      }
      /* Ensure tooltip container uses proper positioning */
      div[data-popper-placement] {
        position: fixed !important;
      }
      /* Force Popper to recalculate on any changes */
      .react-joyride__spotlight {
        transition: all 0.3s ease-in-out !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Debug: Log before rendering
  useEffect(() => {
    if (tourType === "dashboard") {
      console.log("[Tour] TourWrapper render check:", {
        stepsLength: steps.length,
        isRunning,
        isWaitingForStep,
        runProp: isRunning && !isWaitingForStep,
      });
    }
  });

  if (steps.length === 0) {
    console.warn("[Tour] No steps provided!");
    return null;
  }

  // Don't pause - let react-joyride handle positioning with getPopper updates
  const runValue = isRunning;

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

  return (
    <Joyride
      key={`joyride-${tourType}`}
      steps={steps}
      run={runValue}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={(data) => {
        console.log("[Tour] Joyride callback:", data);
        handleJoyrideCallback(data);
      }}
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
        disableFlip: false,
        hideArrow: false,
        offset: 10,
        options: {
          preventOverflow: {
            boundariesElement: "viewport",
          },
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                altAxis: true,
                padding: 8,
              },
            },
            {
              name: "flip",
              options: {
                fallbackPlacements: ["top", "bottom", "left", "right"],
              },
            },
            {
              name: "computeStyles",
              options: {
                adaptive: true,
                gpuAcceleration: false, // Disable GPU acceleration to prevent positioning issues
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
        getPopper: (popper: any, origin: "floater" | "wrapper") => {
          // getPopper is called for continuous position updates
          // Element verification and scrolling happens in step:before where we have the correct index
          if (origin === "floater" && popper) {
            // Try to get the step index from the popper instance or use the ref
            // The popper might have state about the current step
            let currentIndex = currentStepIndexRef.current;

            // Try to find the current step by checking the popper's reference element
            // Also check for elements with the spotlight class (react-joyride adds this)
            let foundStep = false;

            if (popper?.state?.elements?.reference) {
              const referenceElement = popper.state.elements.reference;

              if (tourType === "dashboard") {
                console.log(
                  `[Tour] getPopper: Checking reference element:`,
                  referenceElement,
                  `tagName: ${referenceElement.tagName}, id: ${referenceElement.id}, classes: ${referenceElement.className}`,
                  `data-tour: ${referenceElement.getAttribute?.("data-tour")}`
                );
              }

              // Find which step this element belongs to by checking all steps
              for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                if (step?.target) {
                  const targetSelector = step.target as string;
                  const tourAttribute =
                    targetSelector.match(/data-tour="([^"]+)"/)?.[1];

                  if (tourAttribute) {
                    // Check if the reference element matches this step's target
                    const targetElement = document.querySelector(
                      `[data-tour="${tourAttribute}"]`
                    );

                    // Multiple ways to check if elements match:
                    let isMatch = false;
                    if (targetElement) {
                      // 1. Direct match
                      if (referenceElement === targetElement) {
                        isMatch = true;
                      }
                      // 2. Reference contains target
                      else if (
                        referenceElement.contains &&
                        referenceElement.contains(targetElement)
                      ) {
                        isMatch = true;
                      }
                      // 3. Target contains reference
                      else if (
                        targetElement.contains &&
                        targetElement.contains(referenceElement)
                      ) {
                        isMatch = true;
                      }
                      // 4. Reference is closest to target
                      else if (referenceElement.closest) {
                        const closest = referenceElement.closest(
                          `[data-tour="${tourAttribute}"]`
                        );
                        if (closest === targetElement) {
                          isMatch = true;
                        }
                      }
                      // 5. Reference has the data-tour attribute
                      else if (
                        referenceElement.getAttribute &&
                        referenceElement.getAttribute("data-tour") ===
                          tourAttribute
                      ) {
                        isMatch = true;
                      }
                    }

                    if (isMatch) {
                      currentIndex = i;
                      foundStep = true;
                      if (tourType === "dashboard") {
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

            // Fallback: Check for elements with spotlight (react-joyride adds this class)
            // The spotlight is positioned relative to the target element
            if (!foundStep) {
              // Try multiple ways to find the highlighted element
              const spotlightElement = document.querySelector(
                ".react-joyride__spotlight"
              ) as HTMLElement;

              if (spotlightElement) {
                if (tourType === "dashboard") {
                  console.log(
                    `[Tour] getPopper: Spotlight element found, checking for highlighted element`
                  );
                }

                // The spotlight's parent or the element it's positioned relative to
                // Check the spotlight's computed position to find nearby elements with data-tour
                const spotlightRect = spotlightElement.getBoundingClientRect();

                // Find all elements with data-tour attributes and check which one the spotlight is highlighting
                const allTourElements =
                  document.querySelectorAll("[data-tour]");

                for (const tourElement of allTourElements) {
                  const elementRect = (
                    tourElement as HTMLElement
                  ).getBoundingClientRect();

                  // Check if spotlight is positioned near this element (within a small margin)
                  const isNearby =
                    Math.abs(spotlightRect.left - elementRect.left) < 50 &&
                    Math.abs(spotlightRect.top - elementRect.top) < 50 &&
                    Math.abs(spotlightRect.width - elementRect.width) < 50 &&
                    Math.abs(spotlightRect.height - elementRect.height) < 50;

                  if (isNearby) {
                    const tourAttribute = (
                      tourElement as HTMLElement
                    ).getAttribute("data-tour");

                    // Find which step this corresponds to
                    for (let i = 0; i < steps.length; i++) {
                      const step = steps[i];
                      if (step?.target) {
                        const targetSelector = step.target as string;
                        const stepTourAttribute =
                          targetSelector.match(/data-tour="([^"]+)"/)?.[1];

                        if (stepTourAttribute === tourAttribute) {
                          currentIndex = i;
                          foundStep = true;
                          if (tourType === "dashboard") {
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
              }
            }

            // Final fallback: Use the ref value (might be stale but better than nothing)
            if (!foundStep && tourType === "dashboard") {
              console.log(
                `[Tour] getPopper: Could not find step from popper/spotlight, using ref value: ${currentIndex}`
              );
            }

            // Get current step config
            const currentStep = steps[currentIndex];

            if (tourType === "dashboard") {
              console.log(
                `[Tour] getPopper processing: origin=${origin}, stepIndex=${currentIndex}, hasStep=${!!currentStep}, stepTarget=${currentStep?.target}`
              );
            }

            if (currentStep?.target) {
              // Get the target element to verify it's ready
              const targetSelector = currentStep.target as string;
              const tourAttribute =
                targetSelector.match(/data-tour="([^"]+)"/)?.[1];

              // For steps 3-6 (index 2-5), ensure element is ready before positioning
              const needsExtraCare =
                currentIndex >= 2 &&
                currentIndex <= 5 &&
                (tourAttribute === "reports-table" ||
                  tourAttribute === "recent-updates" ||
                  tourAttribute === "summary-panel" ||
                  tourAttribute === "settings-button");

              if (needsExtraCare && tourAttribute) {
                console.log(
                  `[Tour] getPopper: Verifying element ${tourAttribute} for step ${currentIndex}`
                );
                const element = document.querySelector(
                  `[data-tour="${tourAttribute}"]`
                ) as HTMLElement;

                if (element) {
                  // Ensure element is in viewport and has dimensions
                  const rect = element.getBoundingClientRect();
                  const isInViewport =
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <=
                      (window.innerHeight ||
                        document.documentElement.clientHeight) &&
                    rect.right <=
                      (window.innerWidth ||
                        document.documentElement.clientWidth);

                  console.log(
                    `[Tour] getPopper: Element ${tourAttribute} - inViewport: ${isInViewport}, dimensions: ${rect.width}x${rect.height}, position: (${rect.left}, ${rect.top}), viewport: ${window.innerWidth}x${window.innerHeight}`
                  );

                  if (!isInViewport || rect.width === 0 || rect.height === 0) {
                    console.log(
                      `[Tour] getPopper: Element ${tourAttribute} not ready, scrolling into view`
                    );
                    // Element not ready - scroll it into view
                    if (tourAttribute !== "settings-button") {
                      element.scrollIntoView({
                        behavior: "instant",
                        block: "center",
                        inline: "nearest",
                      });
                    }

                    // Force reflow
                    void element.offsetHeight;
                    void element.getBoundingClientRect();
                  }
                } else {
                  console.warn(
                    `[Tour] getPopper: Element ${tourAttribute} not found in DOM`
                  );
                }
              }
            }

            // Store popper reference for continuous updates
            const updatePopper = () => {
              if (popper?.update) {
                try {
                  popper.update();
                } catch {
                  // Ignore popper update errors
                }
              }
            };

            // Immediate update
            updatePopper();

            // Schedule multiple updates with increasing intervals
            // This ensures tooltip positions correctly even if element moves or scrolls
            setTimeout(updatePopper, 5);
            setTimeout(updatePopper, 10);
            setTimeout(updatePopper, 20);
            setTimeout(updatePopper, 30);
            setTimeout(updatePopper, 50);
            setTimeout(updatePopper, 75);
            setTimeout(updatePopper, 100);
            setTimeout(updatePopper, 150);
            setTimeout(updatePopper, 200);
            setTimeout(updatePopper, 300);
            setTimeout(updatePopper, 400);
            setTimeout(updatePopper, 500);
            setTimeout(updatePopper, 600);
            setTimeout(updatePopper, 800);
            setTimeout(updatePopper, 1000);
          }
        },
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
