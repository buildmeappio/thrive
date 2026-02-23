'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown } from '@/components/Dropdown';
import { ChevronDown } from 'lucide-react';
import {
  ExaminationSchema,
  type ExaminationData,
  type ExaminationDetails,
  type ExaminationType,
  type ExaminationService,
  createExaminationDetails,
  getServiceByType,
  updateServiceInArray,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import BackButton from '@/components/BackButton';
import { UrgencyLevels } from '@/config/urgencyLevel.config';
import { provinceOptions } from '@/config/ProvinceOptions';
import { type DropdownOption } from '../types/CaseInfo';
import ToggleSwitch from '@/components/ToggleSwtch';
import { locationOptions } from '@/config/locationType';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CustomDatePicker from '@/components/CustomDatePicker';
import GoogleMapsInput from '@/components/GoogleMapsInputRHF';
import { getCaseData, getExaminationBenefits, getOrganizationDueDateOffset } from '../actions';
import MultiSelectBenefits from '@/components/MultiSelectDropDown';
import log from '@/utils/log';

interface ExaminationProps extends IMEReferralProps {
  examinationTypes: DropdownOption[];
  languages: DropdownOption[];
  examinationData?: Awaited<ReturnType<typeof getCaseData>>['result']['step5'];
  caseData?: Awaited<ReturnType<typeof getCaseData>>['result']['step4'];
  mode?: 'create' | 'edit';
}

const ExaminationDetailsComponent: React.FC<ExaminationProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  examinationTypes: examinationTypeOptions,
  languages: languageOptions,
  examinationData,
  caseData,
  mode,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [benefitsByType, setBenefitsByType] = useState<
    Record<string, Array<{ id: string; benefit: string }>>
  >({});
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  const [minDueDate, setMinDueDate] = useState<Date | null>(null);

  const selectedExamTypes: ExaminationType[] = useMemo(
    () => data.step4?.caseTypes || caseData?.caseTypes || [],
    [data.step4?.caseTypes, caseData?.caseTypes]
  );

  useEffect(() => {
    const fetchBenefits = async () => {
      if (selectedExamTypes.length === 0) return;

      setLoadingBenefits(true);
      try {
        const benefitsPromises = selectedExamTypes.map(async examType => {
          const benefits = await getExaminationBenefits(examType.id);
          return { typeId: examType.id, benefits };
        });

        const results = await Promise.all(benefitsPromises);

        const benefitsMap: Record<string, Array<{ id: string; benefit: string }>> = {};
        results.forEach(({ typeId, benefits }) => {
          benefitsMap[typeId] = benefits.result;
        });

        setBenefitsByType(benefitsMap);
      } catch (error) {
        log.error('Error fetching benefits:', error);
      } finally {
        setLoadingBenefits(false);
      }
    };

    fetchBenefits();
  }, [selectedExamTypes]);

  // Fetch organization due date offset and calculate minimum due date
  useEffect(() => {
    const fetchDueDateOffset = async () => {
      try {
        const offsetDays = await getOrganizationDueDateOffset();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minDate = new Date(today);
        minDate.setDate(today.getDate() + offsetDays);

        setMinDueDate(minDate);
      } catch (error) {
        log.error('Error fetching due date offset:', error);
      }
    };

    fetchDueDateOffset();
  }, []);

  const ensureCompleteServices = (services: ExaminationService[] = []): ExaminationService[] => {
    const serviceTypes: ExaminationService['type'][] = ['transportation', 'interpreter'];
    const completeServices: ExaminationService[] = [];

    serviceTypes.forEach(type => {
      const existing = services.find(s => s.type === type);
      if (existing) {
        completeServices.push(existing);
      } else {
        completeServices.push({ type, enabled: false, details: {} });
      }
    });

    return completeServices;
  };

  const fixDateFormat = (date: string | undefined): string => {
    if (!date) return '';
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    return date;
  };

  const formDefaultValues = useMemo((): ExaminationData => {
    // Priority 1: Data from Zustand store (if user has edited)
    if (data.step5?.examinations && data.step5.examinations.length > 0) {
      const examinations = data.step5.examinations.map(exam => {
        const fixed = {
          ...exam,
          dueDate: fixDateFormat(exam.dueDate),
          services: ensureCompleteServices(exam.services),
          selectedBenefits: exam.selectedBenefits || [],
        };
        return fixed;
      });

      const result = {
        ...data.step5,
        examinations,
      };
      return result;
    }

    // Priority 2: Data from database (initial load in edit mode)
    if (examinationData?.examinations && examinationData.examinations.length > 0) {
      const examinations = examinationData.examinations.map(exam => {
        const fixed = {
          ...exam,
          dueDate: fixDateFormat(exam.dueDate),
          services: ensureCompleteServices(exam.services),
          selectedBenefits: exam.selectedBenefits || [],
        };
        return fixed;
      });

      const result = {
        ...examinationData,
        examinations,
      };
      return result;
    }

    // Priority 3: Create new examinations based on selected types
    const examinations = selectedExamTypes.map(examType => createExaminationDetails(examType.id));

    return {
      reasonForReferral: '',
      examinationType: '',
      examinations,
    };
  }, [data.step5, examinationData, selectedExamTypes]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExaminationData>({
    resolver: zodResolver(ExaminationSchema),
    defaultValues: formDefaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (_hasHydrated) {
      reset(formDefaultValues);
    }
  }, [_hasHydrated, formDefaultValues, reset]);

  const watchedValues = watch();

  // Check if all required fields are filled (not empty)
  // Validation errors will show when user clicks Continue
  const areAllRequiredFieldsFilled = useMemo(() => {
    const examinationType = watchedValues.examinationType?.trim() || '';
    const reasonForReferral = watchedValues.reasonForReferral?.trim() || '';
    const examinations = watchedValues.examinations || [];

    // Check case information fields - only check if they have values, not minimum length
    if (!examinationType || !reasonForReferral || reasonForReferral.length === 0) {
      return false;
    }

    // Check each examination has all required fields - only check if they have values
    for (const examination of examinations) {
      if (
        !examination.examinationTypeId ||
        !examination.urgencyLevel ||
        !examination.dueDate ||
        !examination.instructions ||
        examination.instructions.trim().length === 0 ||
        !examination.selectedBenefits ||
        examination.selectedBenefits.length === 0 ||
        !examination.locationType
      ) {
        return false;
      }
    }

    return examinations.length > 0;
  }, [watchedValues.examinationType, watchedValues.reasonForReferral, watchedValues.examinations]);

  // Handle service toggle changes
  const handleServiceToggle = useCallback(
    (examinationIndex: number, serviceType: ExaminationService['type'], enabled: boolean) => {
      const currentExaminations = watchedValues.examinations || [];
      const examination = currentExaminations[examinationIndex];

      if (!examination) return;

      const services = examination.services || [];

      const updatedServices = updateServiceInArray(services, serviceType, {
        enabled,
        details: enabled ? services.find(s => s.type === serviceType)?.details || {} : {},
      });

      const updatedExaminations = [...currentExaminations];
      updatedExaminations[examinationIndex] = {
        ...examination,
        services: updatedServices,
      };

      setValue('examinations', updatedExaminations, { shouldDirty: true });
    },
    [watchedValues.examinations, setValue]
  );

  // Handle service detail updates
  const handleServiceDetailUpdate = useCallback(
    (
      examinationIndex: number,
      serviceType: ExaminationService['type'],
      field: string,
      value: string
    ) => {
      const currentExaminations = watchedValues.examinations || [];
      const examination = currentExaminations[examinationIndex];

      if (!examination) return;

      const services = examination.services || [];
      const service = getServiceByType(services, serviceType);
      if (!service) return;

      const updatedServices = updateServiceInArray(services, serviceType, {
        details: {
          ...service.details,
          [field]: value,
        },
      });

      const updatedExaminations = [...currentExaminations];
      updatedExaminations[examinationIndex] = {
        ...examination,
        services: updatedServices,
      };

      setValue('examinations', updatedExaminations, {
        shouldDirty: true,
        shouldValidate: true,
      });
      // Manually trigger validation for the specific field path
      trigger(`examinations.${examinationIndex}.services`);
    },
    [watchedValues.examinations, setValue]
  );

  const handleTransportationPlaceSelect = useCallback(
    (examinationIndex: number, placeData: any) => {
      const currentExaminations = watchedValues.examinations || [];
      const examination = currentExaminations[examinationIndex];

      if (!examination) return;

      const services = examination.services || [];
      const transportationService = getServiceByType(services, 'transportation');

      if (!transportationService) return;

      const updatedServices = updateServiceInArray(services, 'transportation', {
        enabled: transportationService.enabled,
        details: {
          ...transportationService.details,
          pickupAddress: placeData.formattedAddress || '',
          streetAddress: placeData.streetAddress || '',
          city: placeData.city || '',
          postalCode: placeData.postalCode || '',
          province: placeData.province || '',
        },
      });

      const updatedExaminations = [...currentExaminations];
      updatedExaminations[examinationIndex] = {
        ...examination,
        services: updatedServices,
      };

      setValue('examinations', updatedExaminations, { shouldDirty: true });
    },
    [watchedValues.examinations, setValue]
  );

  // Toggle section collapse state
  const toggleSectionCollapse = useCallback((examTypeId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [examTypeId]: !prev[examTypeId],
    }));
  }, []);

  const onSubmit: SubmitHandler<ExaminationData> = useCallback(
    values => {
      setAttemptedSubmit(true);
      setData('step5', values);
      onNext?.();
    },
    [setData, onNext]
  );

  const onError = useCallback(
    (errors: any) => {
      setAttemptedSubmit(true);
      // Manually trigger validation for all examination fields and services to ensure errors are set
      if (watchedValues.examinations) {
        watchedValues.examinations.forEach((_, index) => {
          trigger(`examinations.${index}`);
          trigger(`examinations.${index}.services`);
          // Trigger validation for each service in the examination
          const examination = watchedValues.examinations[index];
          if (examination?.services) {
            examination.services.forEach((_, serviceIndex) => {
              trigger(`examinations.${index}.services.${serviceIndex}`);
              trigger(`examinations.${index}.services.${serviceIndex}.details`);
            });
          }
        });
      }
    },
    [trigger, watchedValues.examinations]
  );

  // Helper function to get error message
  const getErrorMessage = (error: any): string => {
    return typeof error?.message === 'string' ? error.message : '';
  };

  // Render transportation fields
  const renderTransportationFields = useCallback(
    (examination: ExaminationDetails, examinationIndex: number) => {
      const transportationService = getServiceByType(examination.services, 'transportation');

      if (!transportationService?.enabled) return null;

      const details = transportationService.details || {};

      return (
        <div className="space-y-4">
          <GoogleMapsInput
            name={`examinations.${examinationIndex}.services.transportation.pickupAddress`}
            value={details.pickupAddress || ''}
            label="Pick-Up Address Lookup"
            placeholder="Enter pickup address"
            required
            setValue={(name, value) =>
              handleServiceDetailUpdate(examinationIndex, 'transportation', 'pickupAddress', value)
            }
            trigger={trigger}
            onPlaceSelect={placeData =>
              handleTransportationPlaceSelect(examinationIndex, placeData)
            }
            error={
              attemptedSubmit && details.pickupAddress && details.pickupAddress.trim().length > 0
                ? (() => {
                    const services = examination.services || [];
                    const transportationServiceIndex = services.findIndex(
                      (s: any) => s?.type === 'transportation'
                    );
                    if (transportationServiceIndex >= 0) {
                      const servicesErrors = errors.examinations?.[examinationIndex]?.services;
                      if (
                        Array.isArray(servicesErrors) &&
                        servicesErrors[transportationServiceIndex]
                      ) {
                        return servicesErrors[transportationServiceIndex]?.details?.pickupAddress;
                      }
                    }
                    return undefined;
                  })()
                : undefined
            }
            className="space-y-2 bg-white"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                field: 'streetAddress',
                placeholder: 'Enter street address',
                label: 'Street Address',
              },
              {
                field: 'aptUnitSuite',
                placeholder: 'Enter apt/unit/suite',
                label: 'Apt / Unit / Suite',
              },
              { field: 'city', placeholder: 'Enter city', label: 'City' },
            ].map(({ field, placeholder, label }) => {
              const fieldValue = (details[field as keyof typeof details] as string) || '';
              // Find the index of the transportation service in the services array
              const services = examination.services || [];
              const transportationServiceIndex = services.findIndex(
                (s: any) => s?.type === 'transportation'
              );

              // Access error by array index - React Hook Form structures errors by index
              let serviceError: any = undefined;
              if (transportationServiceIndex >= 0) {
                const servicesErrors = errors.examinations?.[examinationIndex]?.services;
                if (Array.isArray(servicesErrors) && servicesErrors[transportationServiceIndex]) {
                  serviceError =
                    servicesErrors[transportationServiceIndex]?.details?.[
                      field as keyof typeof details
                    ];
                }
              }

              // For optional fields, only show error if value exists but doesn't meet minimum requirement
              const shouldShowError =
                attemptedSubmit && serviceError && fieldValue.trim().length > 0;

              return (
                <div key={field} className="space-y-2">
                  <Label className="text-sm text-gray-600">{label}</Label>
                  <Input
                    value={fieldValue}
                    onChange={e =>
                      handleServiceDetailUpdate(
                        examinationIndex,
                        'transportation',
                        field,
                        e.target.value
                      )
                    }
                    disabled={isSubmitting}
                    placeholder={placeholder}
                    className={`w-full bg-white ${shouldShowError ? 'border-red-500' : ''}`}
                  />
                  {shouldShowError && (
                    <p className="text-sm text-red-500">{getErrorMessage(serviceError)}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Postal Code</Label>
              <Input
                value={details.postalCode || ''}
                onChange={e =>
                  handleServiceDetailUpdate(
                    examinationIndex,
                    'transportation',
                    'postalCode',
                    e.target.value
                  )
                }
                disabled={isSubmitting}
                placeholder="Enter postal code"
                className={`bg-white ${
                  (() => {
                    const services = examination.services || [];
                    const transportationServiceIndex = services.findIndex(
                      (s: any) => s?.type === 'transportation'
                    );
                    if (transportationServiceIndex >= 0) {
                      const servicesErrors = errors.examinations?.[examinationIndex]?.services;
                      if (
                        Array.isArray(servicesErrors) &&
                        servicesErrors[transportationServiceIndex]
                      ) {
                        const postalCodeError =
                          servicesErrors[transportationServiceIndex]?.details?.postalCode;
                        return (
                          attemptedSubmit &&
                          postalCodeError &&
                          details.postalCode &&
                          details.postalCode.trim().length > 0
                        );
                      }
                    }
                    return false;
                  })()
                    ? 'border-red-500'
                    : ''
                }`}
              />
              {(() => {
                const services = examination.services || [];
                const transportationServiceIndex = services.findIndex(
                  (s: any) => s?.type === 'transportation'
                );
                if (transportationServiceIndex >= 0) {
                  const servicesErrors = errors.examinations?.[examinationIndex]?.services;
                  if (Array.isArray(servicesErrors) && servicesErrors[transportationServiceIndex]) {
                    const postalCodeError =
                      servicesErrors[transportationServiceIndex]?.details?.postalCode;
                    return (
                      attemptedSubmit &&
                      postalCodeError &&
                      details.postalCode &&
                      details.postalCode.trim().length > 0
                    );
                  }
                }
                return false;
              })() && (
                <p className="text-sm text-red-500">
                  {getErrorMessage(
                    (() => {
                      const services = examination.services || [];
                      const transportationServiceIndex = services.findIndex(
                        (s: any) => s?.type === 'transportation'
                      );
                      if (transportationServiceIndex >= 0) {
                        const servicesErrors = errors.examinations?.[examinationIndex]?.services;
                        if (
                          Array.isArray(servicesErrors) &&
                          servicesErrors[transportationServiceIndex]
                        ) {
                          return servicesErrors[transportationServiceIndex]?.details?.postalCode;
                        }
                      }
                      return undefined;
                    })()
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Dropdown
                id="province"
                label="Province / State"
                value={details.province || ''}
                onChange={(val: string) =>
                  handleServiceDetailUpdate(examinationIndex, 'transportation', 'province', val)
                }
                options={provinceOptions}
                placeholder="Select Province"
                className="h-[45px] bg-white md:h-[55px]"
                icon={false}
              />
            </div>
          </div>
        </div>
      );
    },
    [
      handleServiceDetailUpdate,
      handleTransportationPlaceSelect,
      isSubmitting,
      trigger,
      attemptedSubmit,
      errors,
      getErrorMessage,
    ]
  );

  // Render interpreter fields
  const renderInterpreterFields = useCallback(
    (examination: ExaminationDetails, examinationIndex: number) => {
      const interpreterService = getServiceByType(examination.services, 'interpreter');

      if (!interpreterService?.enabled) return null;

      const details = interpreterService.details || {};

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Dropdown
              id="language"
              label="Select a Language"
              value={details.language || ''}
              onChange={(val: string) =>
                handleServiceDetailUpdate(examinationIndex, 'interpreter', 'language', val)
              }
              options={languageOptions}
              placeholder="Select Language"
              className="h-[45px] bg-white md:h-[55px]"
              icon={false}
              required
            />
          </div>
        </div>
      );
    },
    [handleServiceDetailUpdate, languageOptions]
  );

  const renderToggleSection = useCallback(
    (
      title: string,
      serviceType: ExaminationService['type'],
      examination: ExaminationDetails,
      examinationIndex: number,
      renderContent?: () => React.ReactNode
    ) => {
      const services = examination.services || [];
      const service = getServiceByType(services, serviceType);
      const isEnabled = service?.enabled || false;

      return (
        <div>
          <div className={`flex items-center justify-between ${renderContent ? 'mb-4' : ''}`}>
            <h4 className="text-base font-semibold text-black">{title}</h4>
            <ToggleSwitch
              enabled={isEnabled}
              onChange={value => handleServiceToggle(examinationIndex, serviceType, value)}
              disabled={isSubmitting}
            />
          </div>
          {renderContent?.()}
        </div>
      );
    },
    [handleServiceToggle, isSubmitting]
  );

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        {mode === 'edit' ? 'Edit Case Request' : 'New Case Request'}
      </h1>
      <ProgressIndicator mode={mode} currentStep={currentStep} totalSteps={totalSteps} />
      <div className="w-full max-w-full md:rounded-[30px]">
        <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full max-w-full" noValidate>
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              {/* Case Type and Reason for Referral */}
              <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4 rounded-[20px] bg-white p-4 md:p-0 md:px-[55px] md:py-6">
                <div className="flex justify-between">
                  <h2 className="text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
                    Case Information
                  </h2>
                  <div className="bg-gradient-to-l from-[#01F4C8] to-[#00A8FF] bg-clip-text text-center align-middle text-[14.48px] leading-[160%] font-normal tracking-[-0.02em] text-transparent">
                    Rewrite with AI
                  </div>
                </div>

                <div className="w-full space-y-2 md:w-1/3">
                  <Dropdown
                    id="examinationType"
                    label="Case Type"
                    value={watchedValues.examinationType || ''}
                    onChange={(val: string) => {
                      setValue('examinationType', val, { shouldValidate: true });
                      if (val && errors.examinationType) {
                        trigger('examinationType');
                      }
                    }}
                    options={examinationTypeOptions}
                    placeholder="Select Examination Type"
                    icon={false}
                    required
                  />
                  {attemptedSubmit && errors.examinationType && !watchedValues.examinationType && (
                    <p className="text-sm text-red-500">
                      {getErrorMessage(errors.examinationType)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForReferral">
                    Reason for referral<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    {...register('reasonForReferral')}
                    placeholder="Type here"
                    className={`mt-2 min-h-[120px] w-full resize-none rounded-md ${
                      attemptedSubmit && errors.reasonForReferral ? 'border-red-500' : ''
                    }`}
                  />
                  {attemptedSubmit && errors.reasonForReferral && (
                    <p className="text-sm text-red-500">
                      {getErrorMessage(errors.reasonForReferral)}
                    </p>
                  )}
                </div>
              </div>

              {/* Note */}
              <div className="mb-6 px-[55px]">
                <div className="flex text-lg font-medium">
                  <p className="text-[#000093]">
                    Note:{' '}
                    <span className="text-[#000000]">
                      Please provide required examination(s) details
                    </span>
                  </p>
                </div>
              </div>

              {/* Dynamic sections based on selected exam types */}
              {selectedExamTypes.map((examType: ExaminationType, index: number) => {
                const isCollapsed = collapsedSections[examType.id] || false;
                const examination = watchedValues.examinations?.[index];

                if (!examination) return null;

                return (
                  <div
                    key={examType.id}
                    className="mb-8 w-full rounded-[30px] border border-[#C1C1C1] bg-[#F2F5F6] p-4 md:p-0 md:px-[55px] md:py-6"
                  >
                    <Collapsible
                      open={!isCollapsed}
                      onOpenChange={() => toggleSectionCollapse(examType.id)}
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
                          {index + 1}. {examType.label}
                        </h2>
                        <CollapsibleTrigger asChild>
                          <ChevronDown
                            className={`h-6 w-6 cursor-pointer text-[#000000] ${
                              isCollapsed ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Dropdown
                              id="urgencyLevel"
                              label="Urgency Level"
                              value={examination.urgencyLevel || ''}
                              onChange={(val: string) => {
                                const updatedExaminations = [...(watchedValues.examinations || [])];
                                updatedExaminations[index] = { ...examination, urgencyLevel: val };
                                setValue('examinations', updatedExaminations, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              options={UrgencyLevels}
                              placeholder="Select"
                              className="h-[45px] bg-white md:h-[55px]"
                              icon={false}
                              required
                            />
                            {attemptedSubmit &&
                              errors.examinations?.[index]?.urgencyLevel &&
                              !examination.urgencyLevel && (
                                <p className="text-sm text-red-500">
                                  {getErrorMessage(errors.examinations[index]?.urgencyLevel)}
                                </p>
                              )}
                          </div>

                          <div className="mt-0 space-y-2">
                            <Label className="text-sm font-normal text-[#000000]">
                              Due Date<span className="text-red-500">*</span>
                            </Label>
                            <CustomDatePicker
                              selectedDate={
                                examination.dueDate ? new Date(examination.dueDate) : null
                              }
                              datePickLoading={false}
                              minDate={minDueDate || undefined}
                              onDateChange={date => {
                                const updatedExaminations = [...(watchedValues.examinations || [])];
                                updatedExaminations[index] = {
                                  ...examination,
                                  dueDate: date ? date.toISOString().split('T')[0] : '',
                                };
                                setValue('examinations', updatedExaminations, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              className="bg-white"
                            />
                            {attemptedSubmit &&
                              errors.examinations?.[index]?.dueDate &&
                              !examination.dueDate && (
                                <p className="text-sm text-red-500">
                                  {getErrorMessage(errors.examinations[index]?.dueDate)}
                                </p>
                              )}
                          </div>

                          <div className="space-y-2">
                            <Dropdown
                              id="locationType"
                              label="Location Type"
                              value={examination.locationType || ''}
                              onChange={(val: string) => {
                                const updatedExaminations = [...(watchedValues.examinations || [])];
                                updatedExaminations[index] = {
                                  ...examination,
                                  locationType: val,
                                };
                                setValue('examinations', updatedExaminations, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              options={locationOptions}
                              placeholder="Select"
                              className="h-[45px] bg-white md:h-[55px]"
                              icon={false}
                              required
                            />
                            {attemptedSubmit &&
                              errors.examinations?.[index]?.locationType &&
                              !examination.locationType && (
                                <p className="text-sm text-red-500">
                                  {getErrorMessage(errors.examinations[index]?.locationType)}
                                </p>
                              )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm leading-relaxed font-normal text-[#000000]">
                            Specific Instructions/Notes<span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            disabled={isSubmitting}
                            value={examination.instructions || ''}
                            onChange={e => {
                              const updatedExaminations = [...(watchedValues.examinations || [])];
                              updatedExaminations[index] = {
                                ...examination,
                                instructions: e.target.value,
                              };
                              setValue('examinations', updatedExaminations, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            placeholder="Enter instructions"
                            className={`mt-2 min-h-[100px] w-full rounded-md bg-white ${
                              attemptedSubmit &&
                              errors.examinations?.[index]?.instructions &&
                              (!examination.instructions ||
                                examination.instructions.trim().length < 10)
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          {attemptedSubmit &&
                            errors.examinations?.[index]?.instructions &&
                            (!examination.instructions ||
                              examination.instructions.trim().length < 10) && (
                              <p className="text-sm text-red-500">
                                {getErrorMessage(errors.examinations[index]?.instructions)}
                              </p>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label className="text-sm leading-relaxed font-normal text-[#000000]">
                            Benefits<span className="text-red-500">*</span>
                          </Label>

                          <MultiSelectBenefits
                            benefits={benefitsByType[examType.id] || []}
                            selectedIds={examination.selectedBenefits || []}
                            onChange={selectedIds => {
                              const updatedExaminations = [...(watchedValues.examinations || [])];
                              updatedExaminations[index] = {
                                ...examination,
                                selectedBenefits: selectedIds,
                              };
                              setValue('examinations', updatedExaminations, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            disabled={isSubmitting}
                            loadingBenefits={loadingBenefits}
                          />
                          {attemptedSubmit &&
                            errors.examinations?.[index]?.selectedBenefits &&
                            (!examination.selectedBenefits ||
                              examination.selectedBenefits.length === 0) && (
                              <p className="text-sm text-red-500">
                                {getErrorMessage(errors.examinations[index]?.selectedBenefits)}
                              </p>
                            )}
                        </div>

                        {/* Add-On Services */}
                        <div className="mt-6 space-y-6">
                          {renderToggleSection(
                            'Transportation',
                            'transportation',
                            examination,
                            index,
                            () => renderTransportationFields(examination, index)
                          )}

                          {renderToggleSection(
                            'Interpreter',
                            'interpreter',
                            examination,
                            index,
                            () => renderInterpreterFields(examination, index)
                          )}

                          {/* Support Person is NOT a service - it's a boolean field */}
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-black">Support Person</h4>
                              <ToggleSwitch
                                enabled={examination.supportPerson || false}
                                onChange={value => {
                                  const updatedExaminations = [
                                    ...(watchedValues.examinations || []),
                                  ];
                                  updatedExaminations[index] = {
                                    ...examination,
                                    supportPerson: value,
                                  };
                                  setValue('examinations', updatedExaminations, {
                                    shouldDirty: true,
                                  });
                                }}
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 mb-6 space-y-2">
                          <Label className="text-base font-semibold text-black">
                            Additional Notes
                          </Label>
                          <Textarea
                            disabled={isSubmitting}
                            value={examination.additionalNotes || ''}
                            onChange={e => {
                              const updatedExaminations = [...(watchedValues.examinations || [])];
                              updatedExaminations[index] = {
                                ...examination,
                                additionalNotes: e.target.value,
                              };
                              setValue('examinations', updatedExaminations, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            placeholder="Enter additional notes"
                            className={`mt-2 min-h-[100px] w-full resize-none rounded-md bg-white ${
                              attemptedSubmit &&
                              errors.examinations?.[index]?.additionalNotes &&
                              examination.additionalNotes &&
                              examination.additionalNotes.trim().length < 10
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          {attemptedSubmit &&
                            errors.examinations?.[index]?.additionalNotes &&
                            examination.additionalNotes &&
                            examination.additionalNotes.trim().length < 10 && (
                              <p className="text-sm text-red-500">
                                {getErrorMessage(errors.examinations[index]?.additionalNotes)}
                              </p>
                            )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>

            <div className="mb-8 flex flex-row justify-between gap-4 px-4 md:mb-0 md:px-0">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#000080"
                iconColor="#000080"
                isSubmitting={false}
              />
              <ContinueButton
                isSubmitting={isSubmitting}
                isLastStep={currentStep === totalSteps}
                color="#000080"
                disabled={!areAllRequiredFieldsFilled}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExaminationDetailsComponent;
