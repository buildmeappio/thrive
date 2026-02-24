/**
 * Utility functions to manage completed steps in activationStep field
 * activationStep stores completed steps as comma-separated string: "profile,services,availability"
 */

/**
 * Parse activationStep string into array of completed step IDs
 */
export function parseCompletedSteps(activationStep: string | null | undefined): string[] {
  if (!activationStep || activationStep.trim() === '') {
    return [];
  }
  // Handle special case: "notifications" means all steps are complete
  if (activationStep === 'notifications') {
    return [
      'profile',
      'services',
      'availability',
      'payout',
      'documents',
      'compliance',
      'notifications',
    ];
  }
  // Parse comma-separated string
  return activationStep
    .split(',')
    .map(step => step.trim())
    .filter(step => step.length > 0);
}

/**
 * Add a step to the completed steps list
 */
export function addCompletedStep(
  currentActivationStep: string | null | undefined,
  stepId: string
): string {
  const completedSteps = parseCompletedSteps(currentActivationStep);

  // Don't add if already in the list
  if (completedSteps.includes(stepId)) {
    return currentActivationStep || '';
  }

  // Add the step
  completedSteps.push(stepId);

  // If all 7 steps are complete, return "notifications" (for backward compatibility)
  const allSteps = [
    'profile',
    'services',
    'availability',
    'payout',
    'documents',
    'compliance',
    'notifications',
  ];
  if (allSteps.every(step => completedSteps.includes(step))) {
    return 'notifications';
  }

  // Return comma-separated string
  return completedSteps.join(',');
}

/**
 * Remove a step from the completed steps list
 */
export function removeCompletedStep(
  currentActivationStep: string | null | undefined,
  stepId: string
): string {
  const completedSteps = parseCompletedSteps(currentActivationStep);

  // Remove the step
  const filtered = completedSteps.filter(step => step !== stepId);

  // If no steps are completed, return empty string
  if (filtered.length === 0) {
    return '';
  }

  // Return comma-separated string
  return filtered.join(',');
}

/**
 * Check if a step is completed
 */
export function isStepCompleted(
  activationStep: string | null | undefined,
  stepId: string
): boolean {
  const completedSteps = parseCompletedSteps(activationStep);
  return completedSteps.includes(stepId);
}
