"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import authActions from "@/domains/auth/actions";

/**
 * Hook for fetching and managing years of experience options
 */
export function useYearsOfExperience() {
  const [options, setOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYearsOfExperience = async () => {
      try {
        setLoading(true);
        const years = await authActions.getYearsOfExperience();
        const formattedYears = years.map((year) => ({
          value: year.id,
          label: year.name,
        }));
        setOptions(formattedYears);
      } catch (error) {
        console.error("Failed to fetch years of experience:", error);
        toast.error("Failed to load years of experience options");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYearsOfExperience();
  }, []);

  return {
    options,
    loading,
  };
}
