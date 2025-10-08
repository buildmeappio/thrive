"use client";
import React from "react";
import { Formik, Form } from "formik";
import { Label } from "@/components/ui/label";
import {
  ContinueButton,
  BackButton,
  ProgressIndicator,
  FileUploadInput,
} from "@/components";
import { Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  step6LegalSchema,
  Step6LegalInput,
} from "@/domains/auth/schemas/auth.schemas";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { step6InitialValues } from "@/domains/auth/constants/initialValues";
import { toFormikValidationSchema } from "zod-formik-adapter";

const Legal: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();

  const handleSubmit = (values: Step6LegalInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  const downloadNDA = () => {
    // replace with real download
    console.log("Downloading NDA template...");
  };

  return (
    <div
      className="mt-4 flex min-h-[500px] w-full flex-col rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <Formik
        initialValues={{
          ...step6InitialValues,
          signedNDA: data.signedNDA,
          insuranceProof: data.insuranceProof,
          consentBackgroundVerification: data.consentBackgroundVerification,
          agreeTermsConditions: data.agreeTermsConditions,
        }}
        validationSchema={toFormikValidationSchema(step6LegalSchema)}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize>
        {({ values, errors, setFieldValue, submitForm }) => {
          // useAutoPersist(values, (p) => merge(p as Partial<RegistrationData>));
          return (
            <Form className="flex flex-grow flex-col">
              <div className="flex-grow space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
                <div className="text-center">
                  <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                    Legal & Compliance
                  </h3>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-20 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="signedNDA" className="text-sm text-black">
                        Upload Signed NDA<span className="text-red-500">*</span>
                      </Label>
                      <button
                        onClick={downloadNDA}
                        type="button"
                        className="flex items-center gap-2 text-xs font-medium text-[#00A8FF] hover:text-[#0088CC] sm:text-sm">
                        <Download size={14} className="sm:h-4 sm:w-4" />
                        Download NDA
                      </button>
                    </div>
                    <FileUploadInput
                      name="signedNDA"
                      value={values.signedNDA}
                      onChange={(file) => {
                        setFieldValue("signedNDA", file);
                        merge({ signedNDA: file } as Partial<RegistrationData>);
                      }}
                      accept=".pdf,.doc,.docx"
                      placeholder="Upload Signed NDA"
                      error={errors.signedNDA as string | undefined}
                      showIcon={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <FileUploadInput
                      name="insuranceProof"
                      label="Upload Insurance Proof"
                      value={values.insuranceProof}
                      onChange={(file) => {
                        setFieldValue("insuranceProof", file);
                        merge({
                          insuranceProof: file,
                        } as Partial<RegistrationData>);
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      required
                      placeholder="Upload Insurance Proof"
                      error={errors.insuranceProof as string | undefined}
                      showIcon={false}
                    />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={values.consentBackgroundVerification}
                      onCheckedChange={(checked) =>
                        setFieldValue(
                          "consentBackgroundVerification",
                          Boolean(checked)
                        )
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Consent to Background Verification
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  <div className="ml-0 flex items-center space-x-2 md:ml-5">
                    <Checkbox
                      checked={values.agreeTermsConditions}
                      onCheckedChange={(checked) =>
                        setFieldValue("agreeTermsConditions", Boolean(checked))
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Agree to{" "}
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Privacy Policy
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  {errors.agreeTermsConditions && (
                    <p className="text-xs text-red-500">
                      {errors.agreeTermsConditions}
                    </p>
                  )}
                  {errors.consentBackgroundVerification && (
                    <p className="text-xs text-red-500">
                      {errors.consentBackgroundVerification}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto flex justify-center gap-4 pb-8 md:mt-0 md:justify-between">
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
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Legal;
