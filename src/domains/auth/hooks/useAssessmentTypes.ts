"use client";
import { useState, useEffect } from "react";
import authActions from "../actions";

interface AssessmentTypeOption {
  value: string;
  label: string;
}

/**
 * Hook for fetching assessment types from database
 */
export function useAssessmentTypes() {
  const [assessmentTypes, setAssessmentTypes] = useState<
    AssessmentTypeOption[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentTypes = async () => {
      try {
        setLoading(true);
        const assessmentTypesData = await authActions.getAssessmentTypes();
        const assessmentTypeOptionsData = assessmentTypesData.map(
          (type: { id: string; name: string }) => ({
            value: type.id,
            label: type.name,
          }),
        );
        setAssessmentTypes(assessmentTypeOptionsData);
      } catch (error) {
        console.error("Failed to fetch assessment types:", error);
        setAssessmentTypes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessmentTypes();
  }, []);

  return { assessmentTypes, loading };
}
