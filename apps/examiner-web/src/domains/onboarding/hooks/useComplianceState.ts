'use client';
import { useState, useEffect, useMemo } from 'react';

interface ComplianceAgreements {
  phipaCompliance: boolean;
  pipedaCompliance: boolean;
  medicalLicenseActive: boolean;
}

interface UseComplianceStateOptions {
  initialData?: {
    phipaCompliance?: boolean | null;
    pipedaCompliance?: boolean | null;
    medicalLicenseActive?: boolean | null;
  };
  isCompleted?: boolean;
  onStepEdited?: () => void;
}

/**
 * Hook for managing compliance agreements state and change detection
 */
export function useComplianceState({
  initialData,
  isCompleted = false,
  onStepEdited,
}: UseComplianceStateOptions) {
  const initialAgreements = useMemo<ComplianceAgreements>(() => {
    return {
      phipaCompliance: initialData?.phipaCompliance ?? false,
      pipedaCompliance: initialData?.pipedaCompliance ?? false,
      medicalLicenseActive: initialData?.medicalLicenseActive ?? false,
    };
  }, [initialData]);

  const [agreements, setAgreements] = useState<ComplianceAgreements>(initialAgreements);

  // Reset agreements when initialData changes
  useEffect(() => {
    setAgreements(initialAgreements);
  }, [initialAgreements]);

  // Check if form values have changed from initial saved values
  const hasFormChanged = useMemo(() => {
    const currentHash = JSON.stringify(agreements);
    const initialHash = JSON.stringify(initialAgreements);
    return currentHash !== initialHash;
  }, [agreements, initialAgreements]);

  // If agreements change and step is completed, mark as incomplete
  useEffect(() => {
    if (hasFormChanged && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [hasFormChanged, isCompleted, onStepEdited]);

  // Check if all required checkboxes are checked
  const isFormValid = useMemo(() => {
    return (
      agreements.phipaCompliance && agreements.pipedaCompliance && agreements.medicalLicenseActive
    );
  }, [agreements]);

  const updateAgreement = (key: keyof ComplianceAgreements, value: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    agreements,
    updateAgreement,
    hasFormChanged,
    isFormValid,
    initialAgreements,
  };
}
