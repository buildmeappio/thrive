'use client';
import { useState, useEffect } from 'react';
import { UseFormReturn, FieldValues, Path } from '@/lib/form';
import { getCitiesByProvince } from '@/utils/canadaData';

interface UseCityProvinceLogicOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  province: string | undefined;
  currentCity?: string | undefined;
}

/**
 * Hook for handling city/province dependency logic
 * Updates city options when province changes and resets city if invalid
 */
export function useCityProvinceLogic<T extends FieldValues & { city?: string; province?: string }>({
  form,
  province,
  currentCity,
}: UseCityProvinceLogicOptions<T>) {
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);

  // Initialize city options if province is already selected (for edit mode)
  useEffect(() => {
    if (province) {
      const cities = getCitiesByProvince(province, currentCity);
      setCityOptions(cities);
    }
  }, [province, currentCity]);

  // Update city options when province changes
  useEffect(() => {
    if (province) {
      const currentCityValue = form.getValues('city' as Path<T>) as string | undefined;
      const cities = getCitiesByProvince(province, currentCityValue);
      setCityOptions(cities);

      // Reset city if current city is not in the new province's cities
      if (currentCityValue && !cities.some(c => c.value === currentCityValue)) {
        form.setValue('city' as Path<T>, '' as any);
      }
    } else {
      setCityOptions([]);
      form.setValue('city' as Path<T>, '' as any);
    }
  }, [province, form, currentCity]);

  return { cityOptions };
}
