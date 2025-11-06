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
  type: _type,
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
      acc[field.name] = taxonomy?.[field.name] || '';
      return acc;
    }, {} as TaxonomyFormData),
  });

  useEffect(() => {
    if (taxonomy) {
      config.fields.forEach(field => {
        setValue(field.name, taxonomy[field.name] || '');
      });
    }
  }, [taxonomy, config.fields, setValue]);

  const handleFormSubmit = (data: TaxonomyFormData) => {
    const submitData: CreateTaxonomyInput | UpdateTaxonomyInput = {};
    
    config.fields.forEach(field => {
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
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              disabled={isSubmitting}
            />
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

