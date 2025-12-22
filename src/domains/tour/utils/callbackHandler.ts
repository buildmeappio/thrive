import { CallBackProps, STATUS } from "react-joyride";
import type { Step } from "react-joyride";
import type { TourType } from "../types/tour";
import { handleStepAfterPositioning } from "./tooltipPositioning";
import { prepareStepBefore } from "./stepPreparation";
import { handleStepButtonClick } from "./stepHandlers";
import { findElementByTourAttribute } from "./elementChecker";

export interface CallbackHandlerOptions {
  data: CallBackProps;
  tourType: TourType;
  steps: Step[];
  currentStepIndexRef: React.MutableRefObject<number>;
  setIsWaitingForStep: (waiting: boolean) => void;
  pendingStepRef: React.MutableRefObject<number | null>;
  handleTourComplete: () => void;
  handleTourSkip: () => void;
  stopTour: () => void;
  handleStepChange: (index: number) => void;
}

export function handleJoyrideCallback(options: CallbackHandlerOptions): void {
  const {
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
  } = options;

  const { status, type, index, action, step } = data;

  // Update current step index ref
  if (index !== undefined) {
    currentStepIndexRef.current = index;
  }

  // Log callbacks for debugging
  if (tourType === "dashboard") {
    console.log("[Tour] Joyride callback:", {
      type,
      status,
      index,
      action,
      stepTarget: step?.target,
    });
  }

  // Always allow scrolling during tours
  if (tourType === "dashboard" || tourType === "onboarding") {
    document.body.style.overflow = "";
  }

  // Handle tour completion or skip
  if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
    // Explicitly unlock scroll before cleanup
    document.body.style.overflow = "";
    if (status === STATUS.FINISHED) {
      handleTourComplete();
    } else {
      handleTourSkip();
    }
    stopTour();
    setIsWaitingForStep(false);
    pendingStepRef.current = null;
    // Ensure scroll is unlocked after a short delay (in case of async operations)
    setTimeout(() => {
      document.body.style.overflow = "";
    }, 100);
    return;
  }

  // Handle "Next" button clicks
  if (action === "next" || action === "prev") {
    setIsWaitingForStep(false);
    pendingStepRef.current = null;
  }

  // After step appears, fix positioning for specific steps
  if (type === "step:after" && step?.target) {
    const targetSelector = step.target as string;
    if (index !== undefined) {
      handleStepAfterPositioning(index, targetSelector, tourType);
    }
  }

  // Before showing a step, prepare it
  if (type === "step:before" && step?.target && index !== undefined) {
    const targetSelector = step.target as string;

    // For onboarding tour: close notification step when moving to complete-onboarding-button
    if (
      tourType === "onboarding" &&
      targetSelector.includes("complete-onboarding-button")
    ) {
      // First, ensure the complete button exists
      let completeButton = findElementByTourAttribute(
        "complete-onboarding-button",
      );

      // If not found, try alternative methods
      if (!completeButton) {
        console.log(
          "[Tour] Complete button not found by data-tour, trying alternative methods",
        );
        const buttons = Array.from(
          document.querySelectorAll("button"),
        ) as HTMLElement[];
        completeButton =
          buttons.find((btn) => {
            const text =
              btn.textContent || btn.querySelector("span")?.textContent || "";
            return text.includes("Complete Onboarding");
          }) || null;

        if (completeButton && !completeButton.hasAttribute("data-tour")) {
          completeButton.setAttribute(
            "data-tour",
            "complete-onboarding-button",
          );
          console.log(
            "[Tour] Found complete button by text, added data-tour attribute",
          );
        }
      }

      if (!completeButton) {
        console.warn(
          "[Tour] Complete button not found, will retry in step preparation",
        );
        // Don't pause here, let step preparation handle it
      } else {
        console.log("[Tour] Complete button found:", completeButton);
      }

      // Close notification step if open
      const notificationStepContainer =
        findElementByTourAttribute("step-notifications");
      if (notificationStepContainer) {
        const stepButton = notificationStepContainer.querySelector(
          "button",
        ) as HTMLElement;
        if (stepButton) {
          // Check if step is open
          const buttonParent = stepButton.parentElement;
          if (buttonParent) {
            const allChildren = Array.from(buttonParent.children);
            const buttonIndex = allChildren.indexOf(stepButton);
            for (let i = buttonIndex + 1; i < allChildren.length; i++) {
              const sibling = allChildren[i];
              if (sibling.tagName === "DIV") {
                const hasForm =
                  sibling.querySelector(
                    'form, [class*="Form"], [class*="MultipleFileUploadInput"], [class*="bg-white rounded-2xl"], [class*="rounded-2xl p-6"]',
                  ) !== null;
                if (hasForm) {
                  // Step is open, close it by clicking the button
                  console.log(
                    "[Tour] Closing notification step before showing complete button",
                  );
                  stepButton.click();
                  // Wait for the step to close before continuing
                  setIsWaitingForStep(true);
                  pendingStepRef.current = index;
                  setTimeout(() => {
                    setIsWaitingForStep(false);
                    pendingStepRef.current = null;
                  }, 1500); // Wait 1.5 seconds for step to close
                  return; // Pause tour until step closes
                }
              }
            }
          }
        }
      }
    }

    // Check if this is targeting a step button (for onboarding tours)
    if (targetSelector.startsWith('[data-tour="step-')) {
      const tourAttribute = targetSelector.match(/data-tour="([^"]+)"/)?.[1];

      if (tourAttribute) {
        let stepContainer = findElementByTourAttribute(tourAttribute);

        if (!stepContainer) {
          // Wait a bit and retry finding the container
          setIsWaitingForStep(true);
          pendingStepRef.current = index;
          setTimeout(() => {
            stepContainer = findElementByTourAttribute(tourAttribute);
            if (stepContainer) {
              handleStepButtonClick(
                stepContainer,
                index,
                setIsWaitingForStep,
                pendingStepRef,
                handleStepChange,
              );
            } else {
              console.warn(`Step container not found for: ${tourAttribute}`);
              setIsWaitingForStep(false);
              pendingStepRef.current = null;
              document.body.style.overflow = "";
            }
          }, 200);
          return; // Pause tour until step container is found
        }

        if (stepContainer) {
          // Check if step is already open before calling handleStepButtonClick
          const stepButton = stepContainer.querySelector(
            "button",
          ) as HTMLElement;
          if (stepButton) {
            // Check if step is already open by looking for form content
            const buttonParent = stepButton.parentElement;
            let isStepAlreadyOpen = false;

            if (buttonParent) {
              const allChildren = Array.from(buttonParent.children);
              const buttonIndex = allChildren.indexOf(stepButton);
              for (let i = buttonIndex + 1; i < allChildren.length; i++) {
                const sibling = allChildren[i];
                if (sibling.tagName === "DIV") {
                  const hasForm =
                    sibling.querySelector(
                      'form, [class*="Form"], [class*="MultipleFileUploadInput"], [class*="bg-white rounded-2xl"], [class*="rounded-2xl p-6"]',
                    ) !== null;
                  if (hasForm) {
                    isStepAlreadyOpen = true;
                    break;
                  }
                }
              }
            }

            if (!isStepAlreadyOpen) {
              // Step is not open, we need to open it and pause the tour
              setIsWaitingForStep(true);
              pendingStepRef.current = index;

              // Call handleStepButtonClick to open the step
              handleStepButtonClick(
                stepContainer,
                index,
                setIsWaitingForStep,
                pendingStepRef,
                handleStepChange,
              );

              // Always pause the tour when step needs to be opened
              return; // Pause tour until step is opened
            } else {
              // Step is already open, wait a bit before showing tour
              document.body.style.overflow = "";
              // Wait for any closing animations to complete
              setTimeout(() => {
                // Tour will continue automatically
              }, 1000);
            }
          }
        } else {
          console.warn(`Step container not found for: ${tourAttribute}`);
          document.body.style.overflow = "";
        }
      }
    } else {
      // Not a step button - prepare the step
      const shouldPause = prepareStepBefore({
        index,
        targetSelector,
        tourType,
        setIsWaitingForStep,
        pendingStepRef,
        handleStepChange,
      });

      if (shouldPause) {
        return; // Pause tour until element is ready
      }
    }
  }

  // Handle step progression
  if (type === "step:after") {
    if (pendingStepRef.current === index) {
      pendingStepRef.current = null;
    }

    // For onboarding tour: close any open step when moving to complete-onboarding-button
    if (tourType === "onboarding" && index !== undefined && step?.target) {
      const targetSelector = step.target as string;
      if (targetSelector.includes("complete-onboarding-button")) {
        // Close the notification step if it's open
        const notificationStepContainer =
          findElementByTourAttribute("step-notifications");
        if (notificationStepContainer) {
          const stepButton = notificationStepContainer.querySelector(
            "button",
          ) as HTMLElement;
          if (stepButton) {
            // Check if step is open
            const buttonParent = stepButton.parentElement;
            if (buttonParent) {
              const allChildren = Array.from(buttonParent.children);
              const buttonIndex = allChildren.indexOf(stepButton);
              for (let i = buttonIndex + 1; i < allChildren.length; i++) {
                const sibling = allChildren[i];
                if (sibling.tagName === "DIV") {
                  const hasForm =
                    sibling.querySelector(
                      'form, [class*="Form"], [class*="MultipleFileUploadInput"], [class*="bg-white rounded-2xl"], [class*="rounded-2xl p-6"]',
                    ) !== null;
                  if (hasForm) {
                    // Step is open, close it by clicking the button again
                    console.log(
                      "[Tour] Closing notification step before showing complete button",
                    );
                    stepButton.click();
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (tourType === "dashboard") {
      document.body.style.overflow = "";

      // Pre-scroll next step's element
      if (index !== undefined && index < steps.length - 1) {
        const nextStepIndex = index + 1;
        const nextStep = steps[nextStepIndex];
        if (nextStep?.target) {
          const nextTargetSelector = nextStep.target as string;
          const tourAttribute =
            nextTargetSelector.match(/data-tour="([^"]+)"/)?.[1];

          if (tourAttribute) {
            const isSidebarElement = tourAttribute === "settings-button";
            const needsPreScroll = nextStepIndex >= 2;

            if (needsPreScroll) {
              const nextElement = findElementByTourAttribute(tourAttribute);

              if (nextElement) {
                console.log(
                  `[Tour] Pre-scrolling next element: ${tourAttribute} (step ${nextStepIndex + 1})`,
                );

                if (tourType === "dashboard") {
                  console.log(
                    `[Tour] Pre-scrolling disabled for dashboard - element ${tourAttribute} should already be visible`,
                  );
                } else if (!isSidebarElement) {
                  nextElement.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "nearest",
                  });
                }

                void nextElement.offsetHeight;
                void nextElement.getBoundingClientRect();
                void nextElement.offsetHeight;
                void nextElement.getBoundingClientRect();

                [50, 150, 300].forEach((delay) => {
                  setTimeout(() => {
                    void nextElement.offsetHeight;
                    void nextElement.getBoundingClientRect();
                  }, delay);
                });
              }
            } else {
              setTimeout(() => {
                const nextElement = findElementByTourAttribute(tourAttribute);
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
    handleStepChange(index ?? 0);
  }

  // Handle errors
  if (type === "error:target_not_found") {
    const targetSelector = step?.target as string;
    const tourAttribute = targetSelector?.match(/data-tour="([^"]+)"/)?.[1];

    console.error(
      `Tour target not found for step ${index}: ${tourAttribute || targetSelector}`,
    );

    if (tourAttribute) {
      // Special handling for complete-onboarding-button - retry with more attempts
      const isCompleteButton = tourAttribute === "complete-onboarding-button";
      let element = findElementByTourAttribute(tourAttribute);

      if (!element && isCompleteButton) {
        // Retry finding the complete button - it might be disabled but should exist
        let retries = 0;
        const maxRetries = 20;
        const retryInterval = setInterval(() => {
          retries++;
          element = findElementByTourAttribute(tourAttribute);
          if (element || retries >= maxRetries) {
            clearInterval(retryInterval);
            if (element) {
              console.log(
                `[Tour] Complete button found after retry: ${tourAttribute}`,
                element,
              );
              // Scroll to it smoothly
              element.scrollIntoView({ behavior: "smooth", block: "end" });
              setTimeout(() => {
                // Force tour to continue to this step
                if (index !== undefined) {
                  handleStepChange(index);
                }
              }, 1000);
            } else {
              console.error(
                `[Tour] Element ${tourAttribute} does not exist in DOM after retries`,
              );
            }
          }
        }, 200);
        return;
      }

      if (element) {
        console.log(`Element found manually: ${tourAttribute}`, element);
        const scrollBlock = isCompleteButton ? "end" : "center";
        element.scrollIntoView({ behavior: "instant", block: scrollBlock });
        setTimeout(() => {
          if (index !== undefined && index < steps.length - 1) {
            handleStepChange(index + 1);
          }
        }, 500);
      } else {
        console.error(`Element ${tourAttribute} does not exist in DOM`);
      }
    }
    document.body.style.overflow = "";
  }
}
