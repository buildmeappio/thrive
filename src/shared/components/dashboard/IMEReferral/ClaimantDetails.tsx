'use client';

import React from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/shared/components/ui/input';
import BackButton from '@/shared/components/ui/BackButton';
import ContinueButton from '@/shared/components/ui/ContinueButton';
import { CalendarIcon, MapPin } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import ProgressIndicator from './ProgressIndicator';

// ----------------- CONSTANTS -----------------
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const provinceOptions = [
  { label: 'Ontario', value: 'ontario' },
  { label: 'British Columbia', value: 'bc' },
  { label: 'Quebec', value: 'quebec' },
  { label: 'Alberta', value: 'alberta' },
];

// ---------------------------------------------

interface ClaimantDetailsFormProps {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
}

const initialValues = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  addressLookup: '',
  street: '',
  apt: '',
  city: '',
  postalCode: '',
  province: '',
};

const ClaimantDetailsForm: React.FC<ClaimantDetailsFormProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const handleSubmit = async (
    values: typeof initialValues,
    actions: FormikHelpers<typeof initialValues>
  ) => {
    console.log('Form Submitted:', values);
    if (onNext) onNext();
    actions.setSubmitting(false);
  };

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="mt-4 w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[75px]"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <div className="md:space-y-12">
                <div className="mt-6 w-full px-4 pb-8 md:mt-12 md:px-0">
                  <h2 className="font-semibold text-[36.02px] leading-[36.02px] tracking-[-0.02em] text-[#000000]">Claimant Details</h2>

                  {/* Top Row */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="firstName"
                        placeholder="John"
                        value={values.firstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="lastName"
                        placeholder="Doe"
                        value={values.lastName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <div className="relative">
                        <Input
                          name="dob"
                          placeholder="DD/MM/YYYY"
                          value={values.dob}
                          onChange={handleChange}
                          className="pr-10"
                        />
                        <CalendarIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender (optional)</Label>
                      <Dropdown
                        id="gender"
                        label=""
                        value={values.gender}
                        onChange={(val: string) => setFieldValue('gender', val)}
                        options={genderOptions}
                        placeholder="Select gender"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        name="phone"
                        placeholder="123456789"
                        value={values.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="johndoe20@gmail.com"
                        value={values.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Address Lookup */}
                  <div className="mt-6 space-y-2">
                    <Label htmlFor="addressLookup">
                      Address Lookup<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="addressLookup"
                        placeholder="150 John Street"
                        value={values.addressLookup}
                        onChange={handleChange}
                        className="pl-10"
                      />
                      <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Street / Apt / City */}
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        name="street"
                        placeholder="50 Stephanie Street"
                        value={values.street}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apt">Apt / Unit / Suite</Label>
                      <Input
                        name="apt"
                        placeholder="402"
                        value={values.apt}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        name="city"
                        placeholder="Toronto"
                        value={values.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Postal Code / Province */}
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        name="postalCode"
                        placeholder="7200"
                        value={values.postalCode}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Province / State</Label>
                      <Dropdown
                        id="province"
                        label=""
                        value={values.province}
                        onChange={(val: string) => setFieldValue('province', val)}
                        options={provinceOptions}
                        placeholder="Select province"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
                  <BackButton
                    onClick={onPrevious}
                    disabled={currentStep === 1}
                    borderColor="#000080"
                    iconColor="#000080"
                  />
                  <ContinueButton isLastStep={currentStep === totalSteps} color="#000080" />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default ClaimantDetailsForm;
