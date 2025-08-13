// "use client";
// import React, { useRef, useState } from "react";
// import { Label } from "~/components/ui/label";
// import { Input } from "~/components/ui/input";
// import ContinueButton from "~/components/ui/ContinueButton";
// import BackButton from "~/components/ui/BackButton";
// import { Upload, Download } from "lucide-react";
// import { Checkbox } from "~/components/ui/checkbox";
// import type { MedExaminerRegStepProps } from "~/types";

// export const Step6Legal: React.FC<MedExaminerRegStepProps> = ({
//   onNext,
//   onPrevious,
//   currentStep,
//   totalSteps,
// }) => {
//   const ndaRef = useRef<HTMLInputElement>(null);
//   const insuranceRef = useRef<HTMLInputElement>(null);

//   const [formData, setFormData] = useState({
//     signedNDA: null as File | null,
//     insuranceProof: null as File | null,
//     consentBackgroundVerification: false,
//     agreeTermsConditions: false,
//   });

//   const handleFileChange = (
//     field: "signedNDA" | "insuranceProof",
//     file: File | null,
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: file,
//     }));
//   };

//   const handleCheckboxChange = (field: string, checked: boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: checked,
//     }));
//   };

//   const handleNDAClick = () => {
//     ndaRef.current?.click();
//   };

//   const handleInsuranceClick = () => {
//     insuranceRef.current?.click();
//   };

//   const downloadNDA = () => {
//     console.log("Downloading NDA template...");
//   };

//   return (
//     <div className="space-y-4 px-4 pb-6 md:space-y-6 md:px-0">
//       <div className="text-center">
//         <h3 className="mt-4-md:mt-0 my-4 text-xl font-normal text-[#140047] md:my-10 md:text-2xl md:font-medium">
//           Legal & Compliance
//         </h3>
//       </div>

//       <div className="mt-2 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
//         {/* NDA Upload */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <Label htmlFor="signedNDA" className="text-black">
//               Upload Signed NDA<span className="text-red-500">*</span>
//             </Label>
//             <button
//               onClick={downloadNDA}
//               type="button"
//               className="flex items-center gap-2 text-xs font-medium text-[#00A8FF] hover:text-[#0088CC] sm:text-sm"
//             >
//               <Download size={14} className="sm:h-4 sm:w-4" />
//               Download NDA
//             </button>
//           </div>
//           <Input
//             onClick={handleNDAClick}
//             icon={Upload}
//             type="text"
//             placeholder="DrAhmed_NDA.pdf"
//             value={formData.signedNDA ? formData.signedNDA.name : ""}
//             readOnly
//           />
//           {/* Hidden file input */}
//           <input
//             type="file"
//             ref={ndaRef}
//             accept=".pdf,.doc,.docx"
//             style={{ display: "none" }}
//             onChange={(e) =>
//               handleFileChange("signedNDA", e.target.files?.[0] || null)
//             }
//           />
//         </div>

//         {/* Insurance Proof Upload */}
//         <div className="space-y-2">
//           <Label htmlFor="insuranceProof" className="text-black">
//             Upload Insurance Proof<span className="text-red-500">*</span>
//           </Label>
//           <Input
//             onClick={handleInsuranceClick}
//             icon={Upload}
//             type="text"
//             placeholder="DrAhmed_Insurance.pdf"
//             value={formData.insuranceProof ? formData.insuranceProof.name : ""}
//             readOnly
//           />
//           {/* Hidden file input */}
//           <input
//             type="file"
//             ref={insuranceRef}
//             accept=".pdf,.doc,.docx,.jpg,.png"
//             style={{ display: "none" }}
//             onChange={(e) =>
//               handleFileChange("insuranceProof", e.target.files?.[0] || null)
//             }
//           />
//         </div>
//       </div>

//       {/* Checkboxes */}
//       <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
//         <label className="flex cursor-pointer items-center space-x-2">
//           <Checkbox
//             checked={formData.consentBackgroundVerification}
//             onCheckedChange={(checked) =>
//               handleCheckboxChange(
//                 "consentBackgroundVerification",
//                 checked as boolean,
//               )
//             }
//             checkedColor="#00A8FF"
//             checkIconColor="white"
//           />
//           <span className="text-xs font-medium text-gray-700 sm:text-sm">
//             Consent to Background Verification
//             <span className="text-red-500">*</span>
//           </span>
//         </label>

//         <label className="flex cursor-pointer items-center space-x-2">
//           <Checkbox
//             checked={formData.agreeTermsConditions}
//             onCheckedChange={(checked) =>
//               handleCheckboxChange("agreeTermsConditions", checked as boolean)
//             }
//             checkedColor="#00A8FF"
//             checkIconColor="white"
//             className="flex-shrink-0"
//           />
//           <span className="text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
//             Agree to{" "}
//             <a
//               href="#"
//               className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
//             >
//               Terms & Conditions
//             </a>{" "}
//             and{" "}
//             <a
//               href="#"
//               className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
//             >
//               Privacy Policy
//             </a>
//             <span className="text-red-500">*</span>
//           </span>
//         </label>
//       </div>

//       {/* Buttons */}
//       <div className="mt-10 flex justify-between md:mt-30">
//         <BackButton
//           onClick={onPrevious}
//           disabled={currentStep === 1}
//           borderColor="#00A8FF"
//           iconColor="#00A8FF"
//         />
//         <ContinueButton
//           onClick={onNext}
//           isLastStep={currentStep === totalSteps}
//           gradientFrom="#89D7FF"
//           gradientTo="#00A8FF"
//         />
//       </div>
//     </div>
//   );
// };
'use client';
import React, { useRef } from 'react';
import { Formik, Form } from 'formik';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import BackButton from '@/shared/components/ui/BackButton';
import { Upload, Download } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { MedExaminerRegStepProps } from '@/shared/types';
import { examinerInsuranceSchema } from '@/features/examiner/schemas/examinerSchema';

const step6InitialValues = {
  signedNDA: null as File | null,
  insuranceProof: null as File | null,
  consentBackgroundVerification: false,
  agreeTermsConditions: false,
};

export const Step6Legal: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const ndaRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (values: typeof step6InitialValues) => {
    console.log('Step 6 Form Data:', values);
    onNext();
  };

  const handleNDAClick = (_setFieldValue: any) => () => {
    ndaRef.current?.click();
  };

  const handleInsuranceClick = (_setFieldValue: any) => () => {
    insuranceRef.current?.click();
  };

  const downloadNDA = () => {
    console.log('Downloading NDA template...');
  };

  return (
    <Formik
      initialValues={step6InitialValues}
      validationSchema={examinerInsuranceSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, setFieldValue, submitForm }) => (
        <Form>
          <div className="space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
            <div className="text-center">
              <h3 className="my-4 text-xl font-normal text-[#140047] md:my-10 md:text-2xl md:font-medium">
                Legal & Compliance
              </h3>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
              {/* NDA Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signedNDA" className="text-black">
                    Upload Signed NDA<span className="text-red-500">*</span>
                  </Label>
                  <button
                    onClick={downloadNDA}
                    type="button"
                    className="flex items-center gap-2 text-xs font-medium text-[#00A8FF] hover:text-[#0088CC] sm:text-sm"
                  >
                    <Download size={14} className="sm:h-4 sm:w-4" />
                    Download NDA
                  </button>
                </div>
                <Input
                  onClick={handleNDAClick(setFieldValue)}
                  icon={Upload}
                  type="text"
                  placeholder="DrAhmed_NDA.pdf"
                  value={values.signedNDA ? values.signedNDA.name : ''}
                  readOnly
                />
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={ndaRef}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => setFieldValue('signedNDA', e.target.files?.[0] || null)}
                />
                {errors.signedNDA && <p className="text-xs text-red-500">{errors.signedNDA}</p>}
              </div>

              {/* Insurance Proof Upload */}
              <div className="space-y-3">
                <Label htmlFor="insuranceProof" className="text-black">
                  Upload Insurance Proof<span className="text-red-500">*</span>
                </Label>
                <Input
                  onClick={handleInsuranceClick(setFieldValue)}
                  icon={Upload}
                  type="text"
                  placeholder="DrAhmed_Insurance.pdf"
                  value={values.insuranceProof ? values.insuranceProof.name : ''}
                  readOnly
                />
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={insuranceRef}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  style={{ display: 'none' }}
                  onChange={e => setFieldValue('insuranceProof', e.target.files?.[0] || null)}
                />
                {errors.insuranceProof && (
                  <p className="text-xs text-red-500">{errors.insuranceProof}</p>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={values.consentBackgroundVerification}
                  onCheckedChange={checked =>
                    setFieldValue('consentBackgroundVerification', checked as boolean)
                  }
                  checkedColor="#00A8FF"
                  checkIconColor="white"
                />
                <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                  Consent to Background Verification
                  <span className="text-red-500">*</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={values.agreeTermsConditions}
                  onCheckedChange={checked =>
                    setFieldValue('agreeTermsConditions', checked as boolean)
                  }
                  checkedColor="#00A8FF"
                  checkIconColor="white"
                />
                <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                  Agree to{' '}
                  <a
                    href="#"
                    className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
                  >
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              {errors.agreeTermsConditions && (
                <p className="text-xs text-red-500">{errors.agreeTermsConditions}</p>
              )}

              {errors.consentBackgroundVerification && (
                <p className="text-xs text-red-500">{errors.consentBackgroundVerification}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-10 flex justify-between md:mt-30">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#00A8FF"
                iconColor="#00A8FF"
              />
              <ContinueButton
                onClick={submitForm}
                isLastStep={currentStep === totalSteps}
                gradientFrom="#89D7FF"
                gradientTo="#00A8FF"
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
