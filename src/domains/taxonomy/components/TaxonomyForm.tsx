'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateTaxonomyInput, UpdateTaxonomyInput, TaxonomyType, TaxonomyData } from '../types/Taxonomy';
import { TaxonomyConfig, TaxonomyField } from '../types/Taxonomy';

type TaxonomyFormData = Record<string, string | null | undefined>;

type TaxonomyFormProps = {
  mode: 'create' | 'edit';
  type: TaxonomyType;
  config: TaxonomyConfig;
  taxonomy?: TaxonomyData;
  onSubmit: (data: CreateTaxonomyInput | UpdateTaxonomyInput) => void;
  isSubmitting: boolean;
  examinationTypeOptions?: { label: string; value: string }[];
};

const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  mode,
  type,
  config,
  taxonomy,
  onSubmit,
  isSubmitting,
  examinationTypeOptions = [],
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaxonomyFormData>({
    defaultValues: config.fields.reduce((acc, field) => {
      const value = taxonomy?.[field.name];
      // Convert number to string for form input (especially for configuration value field)
      acc[field.name] = value !== null && value !== undefined ? String(value) : '';
      return acc;
    }, {} as TaxonomyFormData),
  });

  // Watch the name field for configuration to show/hide "(in minutes)" helper text
  const watchedName = type === 'configuration' ? watch('name') : null;

  useEffect(() => {
    if (taxonomy) {
      config.fields.forEach(field => {
        const value = taxonomy[field.name];
        // Convert number to string for form input (especially for configuration value field)
        setValue(field.name, value !== null && value !== undefined ? String(value) : '');
      });
    }
  }, [taxonomy, config.fields, setValue]);

  const handleFormSubmit = (data: TaxonomyFormData) => {
    const submitData: CreateTaxonomyInput | UpdateTaxonomyInput = {};
    
    // For configuration in edit mode, exclude name field (only allow value to be updated)
    const isConfigurationEdit = type === 'configuration' && mode === 'edit';
    
    config.fields.forEach(field => {
      // Skip name field when editing configuration
      if (isConfigurationEdit && field.name === 'name') {
        return;
      }
      
      if (data[field.name] !== undefined && data[field.name] !== '') {
        submitData[field.name] = data[field.name];
      } else if (!field.required) {
        submitData[field.name] = null;
      }
    });
    
    onSubmit(submitData);
  };

  const renderField = (field: TaxonomyField) => {
    const watchedValue = watch(field.name);
    const error = errors[field.name];
    
    // For configuration, check if it's slot duration to show "(in minutes)" helper text
    const isConfiguration = type === 'configuration';
    const isValueField = field.name === 'value' && isConfiguration;
    // Use watchedName (from component level watch) or taxonomy name (for edit mode)
    const configurationName = isConfiguration 
      ? (taxonomy?.name || watchedName || '').toLowerCase()
      : '';
    const isSlotDuration = isConfiguration && configurationName.includes('slot') && configurationName.includes('duration');

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              rows={3}
            />
            {error && <p className="text-sm text-red-500">{error.message as string}</p>}
          </div>
        );

      case 'select':
        const options = field.name === 'examinationTypeId' ? examinationTypeOptions : field.options || [];
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={String(watchedValue || '')}
              onValueChange={value => setValue(field.name, value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-10 rounded-full border-[#E5E7EB] focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] select-scrollbar">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error.message as string}</p>}
          </div>
        );

      case 'text':
      default:
        // Disable name field when editing configuration
        const isConfigurationEdit = type === 'configuration' && mode === 'edit' && field.name === 'name';
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={isValueField ? 'number' : 'text'}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
                validate: isValueField
                  ? (value) => {
                      if (!value && field.required) return `${field.label} is required`;
                      if (value && isNaN(Number(value))) return `${field.label} must be a valid number`;
                      return true;
                    }
                  : undefined,
              })}
              placeholder={field.placeholder}
              disabled={isSubmitting || isConfigurationEdit}
              readOnly={isConfigurationEdit}
              className={isConfigurationEdit ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
            {/* Show "(in Minutes)" helper text only for slot duration configuration */}
            {isSlotDuration && isValueField && (
              <p className="text-sm text-gray-500">(in Minutes)</p>
            )}
            {error && <p className="text-sm text-red-500">{error.message as string}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {config.fields.map(field => renderField(field))}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full">
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </div>
    </form>
  );
};

export default TaxonomyForm;

