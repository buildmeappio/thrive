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
import { getExaminationBenefits } from '../actions';
import MultiSelectBenefits from '@/components/MultiSelectDropDown';
import log from '@/utils/log';

interface ExaminationProps extends IMEReferralProps {
  examinationTypes: DropdownOption[];
  languages: DropdownOption[];
}

const ExaminationDetailsComponent: React.FC<ExaminationProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  examinationTypes: examinationTypeOptions,
  languages: languageOptions,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [benefitsByType, setBenefitsByType] = useState<
    Record<string, Array<{ id: string; benefit: string }>>
  >({});
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  const selectedExamTypes: ExaminationType[] = useMemo(
    () => data.step4?.caseTypes || [],
    [data.step4?.caseTypes]
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

  // Create initial values with proper structure
  const initialValues = useMemo((): ExaminationData => {
    const stepData = data.step5;

    if (stepData && stepData.examinations) {
      return stepData;
    }

    // Create examinations based on selected exam types
    const examinations = selectedExamTypes.map(examType => createExaminationDetails(examType.id));

    return {
      reasonForReferral: stepData?.reasonForReferral || '',
      examinationType: stepData?.examinationType || '',
      examinations,
    };
  }, [selectedExamTypes, data.step5]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ExaminationData>({
    resolver: zodResolver(ExaminationSchema),
    defaultValues: initialValues,
  });

  const watchedValues = watch();

  // Update examinations when selected exam types change
  useEffect(() => {
    const currentExaminations = watchedValues.examinations || [];
    const currentExamTypeIds = currentExaminations.map(exam => exam.examinationTypeId);
    const selectedExamTypeIds = selectedExamTypes.map(examType => examType.id);

    // Check if exam types have changed
    const hasChanged =
      currentExamTypeIds.length !== selectedExamTypeIds.length ||
      currentExamTypeIds.some(id => !selectedExamTypeIds.includes(id)) ||
      selectedExamTypeIds.some(id => !currentExamTypeIds.includes(id));

    if (hasChanged) {
      const updatedExaminations = selectedExamTypes.map(examType => {
        const existingExam = currentExaminations.find(
          exam => exam.examinationTypeId === examType.id
        );
        return existingExam || createExaminationDetails(examType.id);
      });

      setValue('examinations', updatedExaminations);
    }
  }, [selectedExamTypes, setValue, watchedValues.examinations]);

  // Handle service toggle changes
  const handleServiceToggle = useCallback(
    (examinationIndex: number, serviceType: ExaminationService['type'], enabled: boolean) => {
      const currentExaminations = watchedValues.examinations || [];
      const examination = currentExaminations[examinationIndex];

      if (!examination) return;

      const updatedServices = updateServiceInArray(examination.services, serviceType, {
        enabled,
        details: enabled
          ? examination.services.find(s => s.type === serviceType)?.details || {}
          : {},
      });

      const updatedExaminations = [...currentExaminations];
      updatedExaminations[examinationIndex] = {
        ...examination,
        services: updatedServices,
      };

      setValue('examinations', updatedExaminations, { shouldValidate: true });
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

      const service = getServiceByType(examination.services, serviceType);
      if (!service) return;

      const updatedServices = updateServiceInArray(examination.services, serviceType, {
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

      setValue('examinations', updatedExaminations, { shouldValidate: true });
    },
    [watchedValues.examinations, setValue]
  );

  const handleTransportationPlaceSelect = useCallback(
    (examinationIndex: number, placeData: any) => {
      const currentExaminations = watchedValues.examinations || [];
      const examination = currentExaminations[examinationIndex];

      if (!examination) return;

      const transportationService = getServiceByType(examination.services, 'transportation');

      if (!transportationService) return;

      // Update all transportation fields at once with parsed data from GoogleMapsInput
      const updatedServices = updateServiceInArray(examination.services, 'transportation', {
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

      setValue('examinations', updatedExaminations, { shouldValidate: true });
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
      setData('step5', values);
      onNext?.();
    },
    [setData, onNext]
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
            placeholder="150 John Street, Toronto"
            required
            setValue={(name, value) =>
              handleServiceDetailUpdate(examinationIndex, 'transportation', 'pickupAddress', value)
            }
            trigger={trigger}
            onPlaceSelect={placeData =>
              handleTransportationPlaceSelect(examinationIndex, placeData)
            }
            className="space-y-2 bg-white"
          />

          {/* Street / Apt / City */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                field: 'streetAddress',
                placeholder: '50 Stephanie Street',
                label: 'Street Address',
              },
              { field: 'aptUnitSuite', placeholder: '402', label: 'Apt / Unit / Suite' },
              { field: 'city', placeholder: 'Toronto', label: 'City' },
            ].map(({ field, placeholder, label }) => (
              <div key={field} className="space-y-2">
                <Label className="text-sm text-gray-600">{label}</Label>
                <Input
                  value={(details[field as keyof typeof details] as string) || ''}
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
                  className="w-full bg-white"
                />
              </div>
            ))}
          </div>

          {/* Postal Code / Province */}
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
                placeholder="A1A 1A1"
                className="bg-white"
              />
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
    [handleServiceDetailUpdate, handleTransportationPlaceSelect, isSubmitting, trigger]
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
      const service = getServiceByType(examination.services, serviceType);
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
      <h1 className="mb-4 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        New Case Request
      </h1>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="w-full max-w-full md:rounded-[30px]">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              {/* Case Type and Reason for Referral */}
              <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4 rounded-[20px] bg-white p-4 md:p-0 md:px-[40px] md:py-6">
                <h2 className="text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
                  Case Information
                </h2>

                <div className="w-1/3 space-y-2">
                  <Dropdown
                    id="examinationType"
                    label="Case Type"
                    value={watchedValues.examinationType || ''}
                    onChange={(val: string) => setValue('examinationType', val)}
                    options={examinationTypeOptions}
                    placeholder="Select Examination Type"
                    icon={false}
                    required
                  />
                  {errors.examinationType && (
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
                    className={`mt-2 min-h-[120px] w-full resize-none ${
                      errors.reasonForReferral ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.reasonForReferral && (
                    <p className="text-sm text-red-500">
                      {getErrorMessage(errors.reasonForReferral)}
                    </p>
                  )}
                </div>
              </div>

              {/* Note */}
              <div className="mb-6 px-8">
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
                    className="mb-8 w-full rounded-[30px] border border-[#C1C1C1] bg-[#F2F5F6] p-4 md:p-0 md:px-[40px] md:py-6"
                  >
                    <Collapsible
                      open={!isCollapsed}
                      onOpenChange={() => toggleSectionCollapse(examType.id)}
                    >
                      {/* Section Header */}
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-medium text-[#000000]">
                          {index + 1}. {examType.label}
                        </h3>
                        <CollapsibleTrigger asChild>
                          <ChevronDown
                            className={`h-6 w-6 cursor-pointer text-[#000000] ${
                              isCollapsed ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="space-y-4">
                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Dropdown
                              id="urgencyLevel"
                              label="Urgency Level"
                              value={examination.urgencyLevel || ''}
                              onChange={(val: string) => {
                                const updatedExaminations = [...(watchedValues.examinations || [])];
                                updatedExaminations[index] = { ...examination, urgencyLevel: val };
                                setValue('examinations', updatedExaminations);
                              }}
                              options={UrgencyLevels}
                              placeholder="Select"
                              className="h-[45px] bg-white md:h-[55px]"
                              icon={false}
                              required
                            />
                            {errors.examinations?.[index]?.urgencyLevel && (
                              <p className="text-sm text-red-500">
                                {getErrorMessage(errors.examinations[index]?.urgencyLevel)}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 space-y-2">
                            <Label className="text-sm font-normal text-[#000000]">
                              Due Date<span className="text-red-500">*</span>
                            </Label>
                            <CustomDatePicker
                              selectedDate={
                                examination.dueDate ? new Date(examination.dueDate) : null
                              }
                              datePickLoading={false}
                              onDateChange={date => {
                                const updatedExaminations = [...(watchedValues.examinations || [])];
                                updatedExaminations[index] = {
                                  ...examination,
                                  dueDate: date ? date.toISOString().split('T')[0] : '',
                                };
                                setValue('examinations', updatedExaminations, {
                                  shouldValidate: true,
                                });
                              }}
                              className="bg-white"
                            />
                            {errors.examinations?.[index]?.dueDate && (
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
                                setValue('examinations', updatedExaminations);
                              }}
                              options={locationOptions}
                              placeholder="Select"
                              className="h-[45px] bg-white md:h-[55px]"
                              icon={false}
                              required
                            />
                            {errors.examinations?.[index]?.locationType && (
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
                              setValue('examinations', updatedExaminations);
                            }}
                            placeholder="Type here"
                            className={`mt-2 min-h-[100px] w-full resize-none bg-white ${
                              errors.examinations?.[index]?.instructions ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.examinations?.[index]?.instructions && (
                            <p className="text-sm text-red-500">
                              {getErrorMessage(errors.examinations[index]?.instructions)}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
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
                                shouldValidate: true,
                              });
                            }}
                            disabled={isSubmitting}
                            loadingBenefits={loadingBenefits}
                          />
                          {errors.examinations?.[index]?.selectedBenefits && (
                            <p className="text-sm text-red-500">
                              {getErrorMessage(errors.examinations[index]?.selectedBenefits)}
                            </p>
                          )}
                        </div>

                        {/* Add-On Services */}
                        <div className="space-y-6">
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

                          {renderToggleSection('Support Person', 'chaperone', examination, index)}
                        </div>
                        <div className="mb-6 space-y-2">
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
                              setValue('examinations', updatedExaminations);
                            }}
                            placeholder="Type here"
                            className={`mt-2 min-h-[100px] w-full resize-none bg-white ${
                              errors.examinations?.[index]?.additionalNotes ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>

            <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
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
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExaminationDetailsComponent;
