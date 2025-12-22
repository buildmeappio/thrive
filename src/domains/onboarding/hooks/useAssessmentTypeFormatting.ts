"use client";
import { useMemo } from "react";
import {
  Stethoscope,
  Brain,
  Activity,
  FileText,
  AlertCircle,
} from "lucide-react";

interface AssessmentType {
  id: string;
  name: string;
  description: string | null;
}

interface FormattedAssessmentType {
  id: string;
  label: string;
  icon: typeof Activity;
  description?: string;
}

// Icon mapping for assessment types based on name patterns
const getAssessmentTypeIcon = (name: string): typeof Activity => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("orthopedic") || lowerName.includes("functional")) {
    return Activity;
  }
  if (
    lowerName.includes("psychological") ||
    lowerName.includes("psychiatric") ||
    lowerName.includes("neurological") ||
    lowerName.includes("neuropsychological")
  ) {
    return Brain;
  }
  if (lowerName.includes("pain")) {
    return Stethoscope;
  }
  if (lowerName.includes("catastrophic") || lowerName.includes("cat")) {
    return AlertCircle;
  }
  if (
    lowerName.includes("review") ||
    lowerName.includes("paper") ||
    lowerName.includes("file")
  ) {
    return FileText;
  }
  return FileText; // Default icon
};

/**
 * Hook for formatting assessment types with icons
 */
export function useAssessmentTypeFormatting(assessmentTypes: AssessmentType[]) {
  const assessmentTypeOptions = useMemo<FormattedAssessmentType[]>(() => {
    const formattedTypes = assessmentTypes.map((type) => ({
      id: type.id,
      label: type.name,
      icon: getAssessmentTypeIcon(type.name),
      description: type.description || undefined,
    }));
    // Add "Other" option at the end
    formattedTypes.push({
      id: "other",
      label: "Other",
      icon: FileText,
      description: undefined,
    });
    return formattedTypes;
  }, [assessmentTypes]);

  return {
    assessmentTypeOptions,
  };
}
