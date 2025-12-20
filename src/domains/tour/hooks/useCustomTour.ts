"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Step } from "react-joyride";
import type { TourType } from "../types/tour";
import {
  updateTourProgressAction,
  createTourProgressAction,
} from "../server/actions";
import { URLS } from "@/constants/route";

interface UseCustomTourOptions {
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
}

export function useCustomTour({
  steps,
  tourType,
  examinerProfileId,
  autoStart = false,
  tourProgress,
}: UseCustomTourOptions) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    placement: string;
  } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false);

  // Determine if tour should auto-start
  const shouldAutoStart = useCallback(() => {
    if (!autoStart) return false;
    if (!tourProgress) return true;

    if (tourType === "onboarding") {
      return (
        !tourProgress.onboardingTourCompleted &&
        !tourProgress.onboardingTourSkipped
      );
    } else {
      return (
        !tourProgress.dashboardTourCompleted &&
        !tourProgress.dashboardTourSkipped
      );
    }
  }, [autoStart, tourProgress, tourType]);

  // Initialize tour progress if needed
  useEffect(() => {
    const initializeTourProgress = async () => {
      if (!tourProgress) {
        await createTourProgressAction(examinerProfileId);
      }
    };
    initializeTourProgress();
  }, [examinerProfileId, tourProgress]);

  // Calculate tooltip position relative to target element
  const calculateTooltipPosition = useCallback(
    (element: HTMLElement, placement: string) => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 150;
      const spacing = 15;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;
      let finalPlacement = placement;

      switch (placement) {
        case "bottom":
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Adjust if tooltip goes off screen
          if (left < spacing) left = spacing;
          if (left + tooltipWidth > viewportWidth - spacing) {
            left = viewportWidth - tooltipWidth - spacing;
          }
          // If no space below, place above
          if (top + tooltipHeight > viewportHeight - spacing) {
            top = rect.top - tooltipHeight - spacing;
            finalPlacement = "top";
          }
          break;

        case "top":
          top = rect.top - tooltipHeight - spacing;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          if (left < spacing) left = spacing;
          if (left + tooltipWidth > viewportWidth - spacing) {
            left = viewportWidth - tooltipWidth - spacing;
          }
          // If no space above, place below
          if (top < spacing) {
            top = rect.bottom + spacing;
            finalPlacement = "bottom";
          }
          break;

        case "right":
          left = rect.right + spacing;
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          if (top < spacing) top = spacing;
          if (top + tooltipHeight > viewportHeight - spacing) {
            top = viewportHeight - tooltipHeight - spacing;
          }
          // If no space on right, place on left
          if (left + tooltipWidth > viewportWidth - spacing) {
            left = rect.left - tooltipWidth - spacing;
            finalPlacement = "left";
          }
          break;

        case "left":
          left = rect.left - tooltipWidth - spacing;
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          if (top < spacing) top = spacing;
          if (top + tooltipHeight > viewportHeight - spacing) {
            top = viewportHeight - tooltipHeight - spacing;
          }
          // If no space on left, place on right
          if (left < spacing) {
            left = rect.right + spacing;
            finalPlacement = "right";
          }
          break;

        default:
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      return { top, left, placement: finalPlacement };
    },
    [],
  );

  // Find and position target element
  const findAndPositionElement = useCallback(
    (stepIndex: number) => {
      const step = steps[stepIndex];
      if (!step || !step.target) return;

      const targetSelector = step.target as string;
      let element: HTMLElement | null = null;

      // Try to find element by selector
      try {
        element = document.querySelector(targetSelector) as HTMLElement;
      } catch (e) {
        console.error("[Tour] Invalid selector:", targetSelector, e);
      }

      // Fallback for settings button
      if (!element && targetSelector.includes("settings-button")) {
        element = document.querySelector(
          'a[href*="/settings"], a[href*="/setting"]',
        ) as HTMLElement;
        if (element) {
          element.setAttribute("data-tour", "settings-button");
        }
      }

      if (!element) {
        console.warn(
          `[Tour] Element not found for step ${stepIndex}:`,
          targetSelector,
        );
        return null;
      }

      // Ensure element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn(
          `[Tour] Element has zero dimensions for step ${stepIndex}`,
        );
        return null;
      }

      // Scroll element into view if needed (except for fixed sidebar elements)
      if (!targetSelector.includes("settings-button")) {
        const isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth;

        if (!isInViewport) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
          // Wait a bit for scroll to complete, then recalculate
          setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            const newPosition = calculateTooltipPosition(
              element,
              step.placement || "bottom",
            );
            setTooltipPosition(newPosition);
          }, 300);
        }
      }

      // Calculate tooltip position
      const placement = step.placement || "bottom";
      const position = calculateTooltipPosition(element, placement);

      setTargetElement(element);
      setTooltipPosition(position);

      return element;
    },
    [steps, calculateTooltipPosition],
  );

  // Start tour
  const startTour = useCallback(async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    hasNavigatedRef.current = false;
    await updateTourProgressAction(examinerProfileId, {
      tourType,
      started: true,
    });
  }, [examinerProfileId, tourType]);

  // Stop tour
  const stopTour = useCallback(() => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setTargetElement(null);
    setTooltipPosition(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    document.body.style.overflow = "";
  }, []);

  // Go to next step
  const nextStep = useCallback(async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStep = steps[nextIndex];
      const isNextSettingsStep =
        typeof nextStep?.target === "string" &&
        nextStep.target.includes("settings-button");
      const currentPath = window.location.pathname;
      const settingsPath = URLS.SETTINGS; // Use direct path like Sidebar does

      // If next step is settings button and we're not on settings page, navigate first
      if (isNextSettingsStep && !currentPath.includes(settingsPath)) {
        console.log(
          "[Tour] Navigating to settings page before showing step",
          nextIndex,
        );
        router.push(settingsPath);
        // Wait for navigation, then update step
        setTimeout(() => {
          setCurrentStepIndex(nextIndex);
        }, 500);
      } else {
        // Reset navigation flag for next step
        if (!isNextSettingsStep) {
          hasNavigatedRef.current = false;
        }
        setCurrentStepIndex(nextIndex);
      }
    } else {
      // Tour complete
      await updateTourProgressAction(examinerProfileId, {
        tourType,
        completed: true,
      });
      stopTour();
    }
  }, [currentStepIndex, steps, examinerProfileId, tourType, stopTour, router]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const currentStep = steps[currentStepIndex];
      const prevStep = steps[prevIndex];
      const isCurrentSettingsStep =
        typeof currentStep?.target === "string" &&
        currentStep.target.includes("settings-button");
      const isPrevSettingsStep =
        typeof prevStep?.target === "string" &&
        prevStep.target.includes("settings-button");
      const currentPath = window.location.pathname;
      const settingsPath = URLS.SETTINGS;
      const dashboardPath = URLS.DASHBOARD;

      // If we're on settings step and going back to a non-settings step, navigate to dashboard
      if (
        isCurrentSettingsStep &&
        !isPrevSettingsStep &&
        currentPath.includes(settingsPath)
      ) {
        console.log(
          "[Tour] Navigating back to dashboard page before showing step",
          prevIndex,
        );
        router.push(dashboardPath);
        // Wait for navigation, then update step
        setTimeout(() => {
          setCurrentStepIndex(prevIndex);
        }, 500);
      } else {
        setCurrentStepIndex(prevIndex);
      }
    }
  }, [currentStepIndex, steps, router]);

  // Skip tour
  const skipTour = useCallback(async () => {
    await updateTourProgressAction(examinerProfileId, {
      tourType,
      skipped: true,
    });
    stopTour();
  }, [examinerProfileId, tourType, stopTour]);

  // Clear state when step changes to prevent multiple tooltips
  useEffect(() => {
    if (isRunning) {
      // Clear previous step's state immediately when step index changes
      setTargetElement(null);
      setTooltipPosition(null);
    }
  }, [currentStepIndex, isRunning]);

  // Update position when step changes
  useEffect(() => {
    if (isRunning && steps.length > 0) {
      const currentStep = steps[currentStepIndex];
      const isSettingsStep =
        typeof currentStep?.target === "string" &&
        currentStep.target.includes("settings-button");
      const currentPath = window.location.pathname;
      const settingsPath = URLS.SETTINGS; // Use direct path like Sidebar does

      // If settings step and not on settings page, wait for navigation from nextStep
      if (isSettingsStep && !currentPath.includes(settingsPath)) {
        // Navigation should have been triggered by nextStep, just wait
        const timer = setTimeout(() => {
          findAndPositionElement(currentStepIndex);
        }, 1000);

        // Continuously update position (for dynamic content)
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          findAndPositionElement(currentStepIndex);
        }, 200);

        return () => {
          clearTimeout(timer);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        };
      } else {
        // Reset navigation flag if not settings step
        if (!isSettingsStep) {
          hasNavigatedRef.current = false;
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          findAndPositionElement(currentStepIndex);
        }, 150);

        // Continuously update position (for dynamic content)
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          findAndPositionElement(currentStepIndex);
        }, 200);

        return () => {
          clearTimeout(timer);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        };
      }
    }
  }, [isRunning, currentStepIndex, steps, findAndPositionElement, router]);

  // Auto-start tour
  useEffect(() => {
    if (shouldAutoStart()) {
      const delay = tourType === "dashboard" ? 2000 : 1000;
      const timer = setTimeout(() => {
        startTour();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStart, startTour, tourType]);

  return {
    isRunning,
    currentStepIndex,
    currentStep: steps[currentStepIndex] || null,
    targetElement,
    tooltipPosition,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    skipTour,
    totalSteps: steps.length,
  };
}
