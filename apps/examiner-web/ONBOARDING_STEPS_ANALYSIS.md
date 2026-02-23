# Onboarding Steps Analysis & Refactoring Recommendations

## Summary
Analyzed all onboarding step components to identify opportunities for extracting logic into custom hooks, similar to the refactoring done for `profile-info-form.tsx`.

## Components Status

### ✅ Already Refactored
1. **profile-info-form.tsx** (296 lines)
   - Uses custom hooks: `useOnboardingForm`, `useProfilePhoto`, `useYearsOfExperience`, `useProfessionalTitles`, `useProfileFormSubmission`
   - Clean and maintainable

### 🔄 Needs Refactoring

#### 1. **availability-preferences-form.tsx** (554 lines)
**Issues:**
- Complex time conversion logic (UTC ↔ Local time)
- Large `useMemo` blocks for data transformation
- Form initialization with time conversion
- Duplicate submission logic (onSubmit & handleMarkComplete)
- Form change detection logic

**Recommended Hooks:**
- `useAvailabilityTimeConversion` - Handle UTC/local time conversions
- `useAvailabilityFormSubmission` - Handle form submission and mark as complete
- Can reuse `useOnboardingForm` for change detection

**Estimated Reduction:** ~200 lines

---

#### 2. **services-assessment-form.tsx** (542 lines)
**Issues:**
- Assessment type formatting with icons (could be utility)
- Form change detection logic
- Duplicate submission logic
- Toggle logic for assessment types

**Recommended Hooks:**
- `useAssessmentTypeFormatting` - Format assessment types with icons
- `useServicesFormSubmission` - Handle form submission
- Can reuse `useOnboardingForm` for change detection

**Estimated Reduction:** ~150 lines

---

#### 3. **documents-upload-form.tsx** (337 lines)
**Issues:**
- Document loading logic from database
- File change detection
- File upload logic (separate existing vs new files)
- Duplicate submission logic

**Recommended Hooks:**
- `useDocumentLoading` - Load existing documents from database
- `useDocumentUpload` - Handle file uploads and document management
- `useDocumentsFormSubmission` - Handle form submission

**Estimated Reduction:** ~150 lines

---

#### 4. **payout-details-form.tsx** (271 lines)
**Issues:**
- Form change detection logic
- Duplicate submission logic
- Validation logic in handleMarkComplete

**Recommended Hooks:**
- `usePayoutFormSubmission` - Handle form submission with validation
- Can reuse `useOnboardingForm` for change detection

**Estimated Reduction:** ~100 lines

---

#### 5. **compliance-form.tsx** (267 lines)
**Issues:**
- Simple state management (could use form)
- Form change detection
- Duplicate submission logic

**Recommended Hooks:**
- `useComplianceFormSubmission` - Handle form submission
- Can reuse `useOnboardingForm` for change detection

**Estimated Reduction:** ~80 lines

---

#### 6. **notifications-form.tsx** (246 lines)
**Issues:**
- Simple state management
- Form change detection
- Duplicate submission logic

**Recommended Hooks:**
- `useNotificationsFormSubmission` - Handle form submission
- Can reuse `useOnboardingForm` for change detection

**Estimated Reduction:** ~80 lines

---

## Common Patterns Found

### 1. **Duplicate Submission Logic**
All forms have duplicate logic in `onSubmit` and `handleMarkComplete`. This should be extracted into a generic hook.

**Solution:** Create a generic `useFormSubmission` hook that handles both cases.

### 2. **Form Change Detection**
Most forms have similar change detection logic. The existing `useOnboardingForm` hook can be reused.

### 3. **Initial Data Processing**
Many forms have complex `useMemo` blocks for processing initial data. This could be extracted into hooks.

## Recommended Action Plan

### Phase 1: Generic Hooks (High Priority)
1. Create `useFormSubmission` - Generic hook for form submission
2. Enhance `useOnboardingForm` - Ensure it works for all forms

### Phase 2: Component-Specific Hooks (Medium Priority)
1. `useAvailabilityTimeConversion` + `useAvailabilityFormSubmission`
2. `useDocumentLoading` + `useDocumentUpload` + `useDocumentsFormSubmission`
3. `useServicesFormSubmission`
4. `usePayoutFormSubmission`
5. `useComplianceFormSubmission`
6. `useNotificationsFormSubmission`

### Phase 3: Utility Functions (Low Priority)
1. Extract assessment type icon mapping to utility
2. Extract time conversion functions to utilities (if not already done)

## Estimated Total Reduction
- **Current Total:** ~2,217 lines across all forms
- **After Refactoring:** ~1,457 lines
- **Reduction:** ~760 lines (34% reduction)

## Benefits
1. **Maintainability:** Logic separated into testable hooks
2. **Reusability:** Hooks can be shared across components
3. **Consistency:** All forms follow the same patterns
4. **Testability:** Hooks can be tested in isolation
5. **Readability:** Components focus on UI, hooks handle logic

