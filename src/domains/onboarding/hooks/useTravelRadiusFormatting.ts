"use client";
import { useMemo } from "react";

interface TravelDistance {
  id: string;
  name: string;
}

interface TravelRadiusOption {
  value: string;
  label: string;
}

/**
 * Hook for formatting travel radius options
 */
export function useTravelRadiusFormatting(
  maxTravelDistances: TravelDistance[],
) {
  const travelRadiusOptions = useMemo<TravelRadiusOption[]>(() => {
    return maxTravelDistances.map((distance) => ({
      value: distance.id,
      label: distance.name,
    }));
  }, [maxTravelDistances]);

  return {
    travelRadiusOptions,
  };
}
