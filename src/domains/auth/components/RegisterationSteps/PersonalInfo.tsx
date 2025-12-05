"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui";
import { Mail, MapPin, User, PhoneCall, Languages } from "lucide-react";
import { ContinueButton, ProgressIndicator } from "@/components";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { RegStepProps } from "@/domains/auth/types/index";
import { step1InitialValues } from "@/domains/auth/constants/initialValues";
import {
  step1PersonalInfoSchema,
  Step1PersonalInfoInput,
} from "@/domains/auth/schemas/auth.schemas";
import authActions from "../../actions";
import ErrorMessages from "@/constants/ErrorMessages";
import {
  FormProvider,
  FormField,
  FormPhoneInput,
  FormDropdown,
} from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import { provinces } from "@/constants/options";
import getLanguages from "@/domains/auth/actions/getLanguages";
import { getCitiesByProvince } from "@/utils/canadaData";

const PersonalInfo: React.FC<RegStepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, isEditMode } = useRegistrationStore();
  const [languages, setLanguages] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [cityOptions, setCityOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Fetch languages from database
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const languagesData = await getLanguages();
        const languageOptions = languagesData.map((lang: any) => ({
          value: lang.id,
          label: lang.name,
        }));
        setLanguages(languageOptions);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
        setLanguages([]);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  // Initialize city options if province is already selected (for edit mode)
  useEffect(() => {
    if (data.province) {
      const cities = getCitiesByProvince(data.province, data.city);
      setCityOptions(cities);
    }
  }, [data.province, data.city]);

  const form = useForm<Step1PersonalInfoInput>({
    schema: step1PersonalInfoSchema,
    defaultValues: {
      ...step1InitialValues,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailAddress: data.emailAddress,
      landlineNumber: data.landlineNumber,
      city: data.city || "",
      province: data.province || "",
      languagesSpoken: data.languagesSpoken || [],
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldUnregister: false,
  });

  // Reset form when store data changes (but preserve errors if form has been submitted)
  useEffect(() => {
    const hasBeenSubmitted = form.formState.isSubmitted;
    form.reset(
      {
        ...step1InitialValues,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress,
        landlineNumber: data.landlineNumber,
        city: data.city || "",
        province: data.province || "",
        languagesSpoken: data.languagesSpoken || [],
      },
      {
        keepErrors: hasBeenSubmitted, // Keep errors if form has been submitted
        keepDirty: false,
        keepIsSubmitted: hasBeenSubmitted,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: hasBeenSubmitted,
      }
    );
  }, [
    data.firstName,
    data.lastName,
    data.phoneNumber,
    data.emailAddress,
    data.landlineNumber,
    data.city,
    data.province,
    data.languagesSpoken,
    form,
  ]);

  const onSubmit = async (values: Step1PersonalInfoInput) => {
    try {
      // Skip email validation in edit mode since the user already exists
      if (!isEditMode) {
        const { exists } = await authActions.checkUserExists(
          values.emailAddress
        );
        if (exists) {
          form.setError("emailAddress", {
            type: "manual",
            message: ErrorMessages.ACCOUNT_ALREADY_EXISTS,
          });
          return;
        }
      }

      merge(values as Partial<RegistrationData>);
      onNext();
    } catch (error) {
      console.error(error);
    }
  };

  // Watch all required fields to enable/disable continue button
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const emailAddress = form.watch("emailAddress");
  const phoneNumber = form.watch("phoneNumber");
  const landlineNumber = form.watch("landlineNumber");
  const city = form.watch("city");
  const province = form.watch("province");
  const languagesSpoken = form.watch("languagesSpoken");

  // State to force re-render when autofill is detected
  const [, setAutofillCheck] = useState(0);

  // Update city options when province changes
  useEffect(() => {
    if (province) {
      const currentCity = form.getValues("city");
      const cities = getCitiesByProvince(province, currentCity);
      setCityOptions(cities);

      // Reset city if current city is not in the new province's cities
      if (currentCity && !cities.some((c) => c.value === currentCity)) {
        form.setValue("city", "");
      }
    } else {
      setCityOptions([]);
      form.setValue("city", "");
    }
  }, [province, form]);

  // Detect autofill specifically for last name and other fields
  useEffect(() => {
    // Periodic check for autofill values (especially for lastName)
    const checkAutofill = setInterval(() => {
      const formValues = form.getValues();
      const watchedValues = {
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        landlineNumber,
        city,
        province,
        languagesSpoken,
      };

      // Check if any form value differs from watched value (indicating autofill)
      const hasAutofill =
        (formValues.firstName &&
          formValues.firstName !== watchedValues.firstName) ||
        (formValues.lastName &&
          formValues.lastName !== watchedValues.lastName) ||
        (formValues.emailAddress &&
          formValues.emailAddress !== watchedValues.emailAddress) ||
        (formValues.phoneNumber &&
          formValues.phoneNumber !== watchedValues.phoneNumber) ||
        (formValues.landlineNumber &&
          formValues.landlineNumber !== watchedValues.landlineNumber) ||
        (formValues.city && formValues.city !== watchedValues.city) ||
        (formValues.province && formValues.province !== watchedValues.province);

      if (hasAutofill) {
        form.trigger(); // Trigger validation to update form state
        setAutofillCheck((prev) => prev + 1); // Force re-render
      }
    }, 300); // Check every 300ms

    // Listen for input events on all input fields (autofill triggers these)
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (
        target &&
        (target.id === "lastName" ||
          target.id === "firstName" ||
          target.id === "emailAddress")
      ) {
        setTimeout(() => {
          form.trigger(target.id as "firstName" | "lastName" | "emailAddress");
          setAutofillCheck((prev) => prev + 1);
        }, 50);
      }
    };

    // Listen for animationstart event (browsers use this for autofill)
    const handleAutofill = (e: AnimationEvent) => {
      if (
        e.animationName === "onAutoFillStart" ||
        e.animationName === "onAutoFillCancel"
      ) {
        setTimeout(() => {
          form.trigger();
          setAutofillCheck((prev) => prev + 1);
        }, 100);
      }
    };

    // Add event listeners
    document.addEventListener("input", handleInput, true);
    document.addEventListener(
      "animationstart",
      handleAutofill as EventListener,
      true
    );

    return () => {
      clearInterval(checkAutofill);
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener(
        "animationstart",
        handleAutofill as EventListener,
        true
      );
    };
  }, [
    form,
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    landlineNumber,
    city,
    province,
    languagesSpoken,
  ]);

  // Get current form values (including autofilled ones) - use getValues as fallback
  const formValues = form.getValues();
  const currentFirstName = firstName || formValues.firstName || "";
  const currentLastName = lastName || formValues.lastName || "";
  const currentEmailAddress = emailAddress || formValues.emailAddress || "";
  const currentPhoneNumber = phoneNumber || formValues.phoneNumber || "";
  const currentLandlineNumber =
    landlineNumber || formValues.landlineNumber || "";
  const currentCity = city || formValues.city || "";
  const currentProvince = province || formValues.province || "";
  const currentLanguagesSpoken =
    languagesSpoken || formValues.languagesSpoken || [];

  const isFormComplete =
    currentFirstName?.trim().length > 0 &&
    currentLastName?.trim().length > 0 &&
    currentEmailAddress?.trim().length > 0 &&
    currentPhoneNumber?.trim().length > 0 &&
    currentLandlineNumber?.trim().length > 0 &&
    currentCity?.trim().length > 0 &&
    currentProvince?.trim().length > 0 &&
    Array.isArray(currentLanguagesSpoken) &&
    currentLanguagesSpoken.length > 0;

  return (
    <div
      className="mt-1 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-2 pb-3 md:px-0">
          <div className="pt-0 md:pt-0">
            <h3 className="mt-2 mb-0 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Enter Your Personal Details
            </h3>
            <div className="mt-2 md:px-0 px-8 grid grid-cols-1 gap-x-12 gap-y-2 md:mt-6 md:grid-cols-2">
              {/* Row 1: First Name, Last Name */}
              <FormField name="firstName" label="First Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="firstName"
                    icon={User}
                    placeholder="Enter your first name"
                    validationType="name"
                    onBlur={(e) => {
                      field.onBlur(e);
                      // Trigger validation after blur to ensure errors clear
                      setTimeout(() => {
                        form.trigger("firstName");
                      }, 0);
                    }}
                  />
                )}
              </FormField>

              <FormField name="lastName" label="Last Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="lastName"
                    icon={User}
                    placeholder="Enter your last name"
                    validationType="name"
                    onBlur={(e) => {
                      field.onBlur(e);
                      // Trigger validation after blur to ensure errors clear
                      setTimeout(() => {
                        form.trigger("lastName");
                      }, 0);
                    }}
                  />
                )}
              </FormField>

              {/* Row 2: Email Address, Languages Spoken */}
              <FormField name="emailAddress" label="Email Address" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="emailAddress"
                    icon={Mail}
                    type="email"
                    placeholder="Enter your email address"
                  />
                )}
              </FormField>

              <FormDropdown
                name="languagesSpoken"
                label="Languages Spoken"
                required
                options={languages}
                placeholder={
                  loadingLanguages ? "Loading languages..." : "Select languages"
                }
                multiSelect={true}
                icon={<Languages size={16} color="#A4A4A4" strokeWidth={2} />}
                disabled={loadingLanguages}
              />

              {/* Row 3: Province, City */}
              <FormDropdown
                name="province"
                label="Province"
                required
                options={provinces}
                placeholder="Select Province"
                icon={<MapPin size={16} color="#A4A4A4" strokeWidth={2} />}
              />

              <FormDropdown
                name="city"
                label="City"
                required
                options={cityOptions}
                placeholder={province ? "Select City" : "Select Province first"}
                icon={<MapPin size={16} color="#A4A4A4" strokeWidth={2} />}
                disabled={!province || cityOptions.length === 0}
              />

              {/* Row 4: Work Number, Cell Number */}
              <FormPhoneInput
                name="landlineNumber"
                label="Work Phone"
                required
                icon={PhoneCall}
                placeholder="Enter your work number"
              />

              <FormPhoneInput
                name="phoneNumber"
                label="Cell Phone"
                required
                placeholder="Enter your cell number"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-row justify-center gap-3 px-2 md:mt-5 md:justify-between md:gap-4 md:px-0">
            <div className="hidden md:block" />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={!isFormComplete || form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PersonalInfo;
