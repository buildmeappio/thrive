'use client';
import React from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { assessmentTypesOptions, languageOptions, preferredFormatOptions, primarySpecialtyOptions, regionOptions, subspecialtyOptions } from '@/shared/config/MedExaminerDropdownOptions';

const MedicalExaminerProfileStep2 = () => {
  const [values, setValues] = React.useState({
    primarySpecialty: "",
    subspecialty: "",
    assessmentTypes: "",
    preferredFormat: "",
    regionsServed: "",
    languagesSpoken: ""
  });

  const errors: Record<string, string> = {};

  const setFieldValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Dropdown
            id="primarySpecialty"
            label="Primary Specialty"
            value={values.primarySpecialty}
            onChange={value => setFieldValue('primarySpecialty', value)}
            options={primarySpecialtyOptions}
            required={true}
            placeholder="Select Primary Specialty"
          />
          {errors.primarySpecialty && <p className="text-xs text-red-500">{errors.primarySpecialty}</p>}
        </div>

        <div>
          <Dropdown
            id="subspecialty"
            label="Subspecialty"
            value={values.subspecialty}
            onChange={value => setFieldValue('subspecialty', value)}
            options={subspecialtyOptions}
            required={true}
            placeholder="Select Subspecialty"
          />
          {errors.subspecialty && <p className="text-xs text-red-500">{errors.subspecialty}</p>}
        </div>

        <div>
          <Dropdown
            id="assessmentTypes"
            label="Assessment Types"
            value={values.assessmentTypes}
            onChange={value => setFieldValue('assessmentTypes', value)}
            options={assessmentTypesOptions}
            required={true}
            placeholder="Select Assessment Types"
          />
          {errors.assessmentTypes && <p className="text-xs text-red-500">{errors.assessmentTypes}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Dropdown
            id="preferredFormat"
            label="Preferred Format"
            value={values.preferredFormat}
            onChange={value => setFieldValue('preferredFormat', value)}
            options={preferredFormatOptions}
            required={true}
            placeholder="Select Preferred Format"
          />
          {errors.preferredFormat && <p className="text-xs text-red-500">{errors.preferredFormat}</p>}
        </div>

        <div>
          <Dropdown
            id="regionsServed"
            label="Regions Served"
            value={values.regionsServed}
            onChange={value => setFieldValue('regionsServed', value)}
            options={regionOptions}
            required={true}
            placeholder="Select Region"
          />
          {errors.regionsServed && <p className="text-xs text-red-500">{errors.regionsServed}</p>}
        </div>

        <div>
          <Dropdown
            id="languagesSpoken"
            label="Languages Spoken"
            value={values.languagesSpoken}
            onChange={value => setFieldValue('languagesSpoken', value)}
            options={languageOptions}
            required={true}
            placeholder="Select Language"
          />
          {errors.languagesSpoken && <p className="text-xs text-red-500">{errors.languagesSpoken}</p>}
        </div>
      </div>
    </div>
  );
};

export default MedicalExaminerProfileStep2;