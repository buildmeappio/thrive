"use client";

import { useState, useEffect, useCallback } from "react";
import type { TourType } from "../types/tour";
import {
  updateTourProgressAction,
  createTourProgressAction,
} from "../server/actions";

interface UseTourOptions {
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

export function useTour({
  tourType,
  examinerProfileId,
  autoStart = false,
  tourProgress,
}: UseTourOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Determine if tour should auto-start
  const shouldAutoStart = useCallback(() => {
    if (!autoStart) return false;

    // If tourProgress is null, it means it hasn't been created yet, so we should start
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

  const handleTourStart = useCallback(async () => {
    try {
      await updateTourProgressAction(examinerProfileId, {
        tourType,
        started: true,
      });
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  }, [examinerProfileId, tourType]);

  // Don't lock scroll - let it be managed dynamically when steps open
  // This allows users to scroll when content expands

  // Auto-start tour if conditions are met
  const shouldAutoStartValue = shouldAutoStart();

  useEffect(() => {
    console.log("[Tour] useTour effect:", {
      shouldAutoStartValue,
      tourType,
      autoStart,
      tourProgress,
    });

    if (shouldAutoStartValue) {
      console.log("[Tour] Starting tour auto-start logic");

      // For onboarding tour, lock scroll at top
      if (tourType === "onboarding") {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.body.style.overflow = "hidden";
      }

      // For dashboard tour, wait longer to ensure all elements are rendered
      const delay = tourType === "dashboard" ? 2000 : 1000;

      // Delay to ensure DOM is ready and elements are rendered
      const timer = setTimeout(() => {
        console.log("[Tour] Delay completed, starting tour");

        if (tourType === "onboarding") {
          // Ensure we're still at the top for onboarding
          window.scrollTo({ top: 0, behavior: "instant" });
        }

        // Start the tour - let TourWrapper handle element checking
        console.log("[Tour] Setting isRunning to true");
        setIsRunning(true);
        setStepIndex(0);
        handleTourStart();

        // For dashboard, don't lock scroll - allow scrolling
        if (tourType === "dashboard") {
          document.body.style.overflow = "";
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [
    shouldAutoStartValue,
    handleTourStart,
    tourType,
    autoStart,
    tourProgress,
  ]);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setStepIndex(0);
    handleTourStart();
  }, [handleTourStart]);

  const stopTour = useCallback(() => {
    setIsRunning(false);
    setStepIndex(0);
    // Unlock scroll when tour stops
    document.body.style.overflow = "";
  }, []);

  const handleTourComplete = useCallback(async () => {
    setIsRunning(false);
    // Unlock scroll when tour completes
    document.body.style.overflow = "";
    try {
      await updateTourProgressAction(examinerProfileId, {
        tourType,
        completed: true,
      });
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  }, [examinerProfileId, tourType]);

  const handleTourSkip = useCallback(async () => {
    setIsRunning(false);
    // Unlock scroll when tour is skipped
    document.body.style.overflow = "";
    try {
      await updateTourProgressAction(examinerProfileId, {
        tourType,
        skipped: true,
      });
    } catch (error) {
      console.error("Error skipping tour:", error);
    }
  }, [examinerProfileId, tourType]);

  const handleStepChange = useCallback((index: number) => {
    setStepIndex(index);
  }, []);

  return {
    isRunning,
    stepIndex,
    startTour,
    stopTour,
    handleTourComplete,
    handleTourSkip,
    handleStepChange,
    shouldAutoStart: shouldAutoStart(),
  };
}
