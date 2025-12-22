# Auth Domain Registration Steps Analysis & Refactoring Recommendations

## Summary
Analyzed all registration step components in the auth domain to identify opportunities for extracting logic into custom hooks, similar to the refactoring done for onboarding steps.

## Components Status

### 🔄 Needs Refactoring

#### 1. **PersonalInfo.tsx** (454 lines)
**Issues:**
- Complex autofill detection logic (lines 188-281)
- Language fetching from database
- City/province dependency logic
- Form reset logic with error preservation
- Email validation logic
- Multiple useEffect hooks

**Recommended Hooks:**
- `useLanguages` - Fetch languages from database
- `useCityProvinceLogic` - Handle city/province dependency
- `useAutofillDetection` - Detect and handle browser autofill
- `useRegistrationFormReset` - Handle form reset with error preservation

**Estimated Reduction:** ~200 lines

---

#### 2. **MedicalCredentials.tsx** (259 lines)
**Issues:**
- Exam types fetching from database
- Form reset logic
- Client-side hydration check
- Form completion validation

**Recommended Hooks:**
- `useExamTypes` - Fetch exam types from database
- `useRegistrationFormReset` - Reusable form reset logic
- `useClientSideOnly` - Handle hydration checks

**Estimated Reduction:** ~100 lines

---

#### 3. **IMEExperience.tsx** (318 lines)
**Issues:**
- Assessment types fetching from database
- Form reset logic
- Form completion validation

**Recommended Hooks:**
- `useAssessmentTypes` - Fetch assessment types (can reuse from onboarding)
- `useRegistrationFormReset` - Reusable form reset logic

**Estimated Reduction:** ~100 lines

---

#### 4. **VerificationDocuments.tsx** (161 lines)
**Issues:**
- Form reset logic
- File array normalization

**Recommended Hooks:**
- `useRegistrationFormReset` - Reusable form reset logic
- `useFileArrayNormalization` - Normalize file arrays

**Estimated Reduction:** ~50 lines

---

#### 5. **ExperienceDetails.tsx** (159 lines)
**Issues:**
- Form reset logic
- Character count logic

**Recommended Hooks:**
- `useRegistrationFormReset` - Reusable form reset logic
- `useCharacterCount` - Handle character counting

**Estimated Reduction:** ~50 lines

---

#### 6. **SubmitConfirmation.tsx** (468 lines)
**Issues:**
- Complex file upload logic
- File processing (separate existing vs new files)
- Document upload to S3
- Form submission with file handling
- Modal state management

**Recommended Hooks:**
- `useFileUpload` - Handle file uploads to S3
- `useFileProcessing` - Process files (existing vs new)
- `useRegistrationSubmission` - Handle final form submission
- `useModalState` - Manage modal open/close states

**Estimated Reduction:** ~250 lines

---

## Common Patterns Found

### 1. **Form Reset Logic**
All registration steps have similar form reset logic that syncs with the registration store. This should be extracted into a reusable hook.

**Solution:** Create `useRegistrationFormReset` hook.

### 2. **Data Fetching**
Multiple steps fetch data from the database (languages, exam types, assessment types). These should be extracted into hooks.

**Solution:** Create hooks like `useLanguages`, `useExamTypes`, `useAssessmentTypes`.

### 3. **Form Completion Validation**
All steps have similar logic to check if the form is complete. This could be extracted.

**Solution:** Create `useFormCompletion` hook.

### 4. **File Handling**
SubmitConfirmation has complex file upload and processing logic that could be extracted.

**Solution:** Create `useFileUpload` and `useFileProcessing` hooks.

## Recommended Action Plan

### Phase 1: Generic Registration Hooks (High Priority)
1. Create `useRegistrationFormReset` - Generic hook for form reset with store sync
2. Create `useFormCompletion` - Generic hook for form completion validation
3. Create `useClientSideOnly` - Handle hydration checks

### Phase 2: Data Fetching Hooks (Medium Priority)
1. `useLanguages` - Fetch languages from database
2. `useExamTypes` - Fetch exam types from database
3. `useAssessmentTypes` - Reuse from onboarding or create new

### Phase 3: Component-Specific Hooks (Medium Priority)
1. `useCityProvinceLogic` - Handle city/province dependency
2. `useAutofillDetection` - Detect browser autofill
3. `useCharacterCount` - Handle character counting
4. `useFileArrayNormalization` - Normalize file arrays

### Phase 4: Complex Submission Logic (High Priority)
1. `useFileUpload` - Handle file uploads to S3
2. `useFileProcessing` - Process files (existing vs new)
3. `useRegistrationSubmission` - Handle final form submission
4. `useModalState` - Manage modal states

## Estimated Total Reduction
- **Current Total:** ~1,819 lines across all registration steps
- **After Refactoring:** ~1,169 lines
- **Reduction:** ~650 lines (36% reduction)

## Benefits
1. **Maintainability:** Logic separated into testable hooks
2. **Reusability:** Hooks can be shared across registration steps
3. **Consistency:** All steps follow the same patterns
4. **Testability:** Hooks can be tested in isolation
5. **Readability:** Components focus on UI, hooks handle logic

## Notes
- Registration steps use a Zustand store (`useRegistrationStore`) for state management
- Steps have "Save and Continue" functionality that saves progress
- Some steps have complex autofill detection for better UX
- File uploads happen in SubmitConfirmation step

