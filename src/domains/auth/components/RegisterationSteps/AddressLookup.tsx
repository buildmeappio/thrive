"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import {
  step2AddressSchema,
  Step2AddressInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step2AddressInitialValues } from "@/domains/auth/constants/initialValues";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import {
  FormProvider,
  FormField,
  FormDropdown,
  FormGoogleMapsInput,
} from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import { provinces } from "@/constants/options";
import {
  GoogleMapsPlaceData,
  GoogleMapsAddressComponent,
} from "@/types/google-maps";

const AddressLookup: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();
  const [_addressComponents, setAddressComponents] = useState<{
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  }>({});

  const form = useForm<Step2AddressInput>({
    schema: step2AddressSchema,
    defaultValues: {
      ...step2AddressInitialValues,
      address: data.address || "",
      street: data.street || "",
      suite: data.suite || "",
      postalCode: data.postalCode || "",
      province: data.province || "",
      city: data.city || "",
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step2AddressInitialValues,
      address: data.address || "",
      street: data.street || "",
      suite: data.suite || "",
      postalCode: data.postalCode || "",
      province: data.province || "",
      city: data.city || "",
    });
  }, [
    data.address,
    data.street,
    data.suite,
    data.postalCode,
    data.province,
    data.city,
    form,
  ]);

  // Handle place selection from Google Maps
  const handlePlaceSelect = (placeData: GoogleMapsPlaceData) => {
    const components = placeData.components || [];

    // Extract address components from Google Places API response
    const extractComponent = (type: string, shortName = false) => {
      const component = components.find(
        (comp: GoogleMapsAddressComponent) =>
          comp.types && comp.types.includes(type),
      );
      return component
        ? shortName
          ? component.short_name
          : component.long_name
        : "";
    };

    const streetNumber = extractComponent("street_number");
    const route = extractComponent("route");
    const street =
      streetNumber && route ? `${streetNumber} ${route}` : route || "";
    const city =
      extractComponent("locality") ||
      extractComponent("administrative_area_level_2");
    const provinceShort = extractComponent("administrative_area_level_1", true);
    const provinceLong = extractComponent("administrative_area_level_1", false);
    const postalCode = extractComponent("postal_code");

    // Map province short code to full name for dropdown
    const provinceCodeToName: { [key: string]: string } = {
      AB: "Alberta",
      BC: "British Columbia",
      MB: "Manitoba",
      NB: "New Brunswick",
      NL: "Newfoundland and Labrador",
      NT: "Northwest Territories",
      NS: "Nova Scotia",
      NU: "Nunavut",
      ON: "Ontario",
      PE: "Prince Edward Island",
      QC: "Quebec",
      SK: "Saskatchewan",
      YT: "Yukon",
    };

    // Get the full province name for the dropdown
    const provinceName =
      provinceCodeToName[provinceShort] || provinceLong || provinceShort;

    // Update form fields with extracted data
    if (street) {
      form.setValue("street", street);
    }
    if (city) {
      form.setValue("city", city);
    }
    if (provinceName) {
      form.setValue("province", provinceName);
    }
    if (postalCode) {
      form.setValue("postalCode", postalCode);
    }

    setAddressComponents({
      street,
      city,
      province: provinceName,
      postalCode,
    });
  };

  const onSubmit = (values: Step2AddressInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-6 pb-8 md:px-0">
          <div className="pt-1 md:pt-0">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-normal text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Work Address Details
            </h3>
            <div className="mt-6 md:px-0 px-8 grid grid-cols-1 gap-x-12 gap-y-4 md:mt-8 md:grid-cols-2">
              <FormGoogleMapsInput
                name="address"
                label="Address Lookup"
                required
                placeholder="Enter your address"
                onPlaceSelect={handlePlaceSelect}
              />

              <FormField name="street" label="Street Address">
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="street"
                    placeholder="Enter street address"
                  />
                )}
              </FormField>

              <FormField name="suite" label="Apt / Unit / Suite">
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="suite"
                    placeholder="Enter apt/unit/suite"
                  />
                )}
              </FormField>

              <FormField name="postalCode" label="Postal Code">
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="postalCode"
                    placeholder="Enter postal code"
                  />
                )}
              </FormField>

              <FormField name="city" label="City">
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input {...field} id="city" placeholder="Enter city" />
                )}
              </FormField>

              <FormDropdown
                name="province"
                label="Province / State"
                options={provinces}
                placeholder="Select province"
                icon={null}
              />
            </div>
          </div>

          <div className="mt-10 flex flex-row justify-center gap-3 px-2 md:mt-12 md:justify-between md:gap-4 md:px-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#00A8FF"
              iconColor="#00A8FF"
            />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default AddressLookup;
