import { TaxonomyConfig, TaxonomyType } from '../types/Taxonomy';

export const TaxonomyConfigs: Record<TaxonomyType, TaxonomyConfig> = {
  caseStatus: {
    name: 'Case Statuses',
    singularName: 'Case Status',
    tableName: 'caseStatus',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter status name',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter description (optional)',
      },
    ],
    displayFields: ['name', 'description'],
    searchFields: ['name', 'description'],
  },
  caseType: {
    name: 'Case Types',
    singularName: 'Case Type',
    tableName: 'caseType',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter type name',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter description (optional)',
      },
    ],
    displayFields: ['name', 'description'],
    searchFields: ['name', 'description'],
  },
  claimType: {
    name: 'Claim Types',
    singularName: 'Claim Type',
    tableName: 'claimType',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter claim type name',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter description (optional)',
      },
    ],
    displayFields: ['name', 'description'],
    searchFields: ['name', 'description'],
  },
  department: {
    name: 'Departments',
    singularName: 'Department',
    tableName: 'department',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter department name',
      },
    ],
    displayFields: ['name'],
    searchFields: ['name'],
  },
  examinationType: {
    name: 'Examination Types',
    singularName: 'Examination Type',
    tableName: 'examinationType',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter examination type name',
      },
      {
        name: 'shortForm',
        label: 'Short Form',
        type: 'text',
        required: false,
        placeholder: 'Enter short form (optional)',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter description (optional)',
      },
    ],
    displayFields: ['name', 'shortForm', 'description'],
    searchFields: ['name', 'shortForm', 'description'],
  },
  examinationTypeBenefit: {
    name: 'Examination Type Benefits',
    singularName: 'Examination Type Benefit',
    tableName: 'examinationTypeBenefit',
    fields: [
      {
        name: 'examinationTypeId',
        label: 'Examination Type',
        type: 'select',
        required: true,
        placeholder: 'Select examination type',
        options: [], // Will be populated dynamically
      },
      {
        name: 'benefit',
        label: 'Benefit',
        type: 'textarea',
        required: true,
        placeholder: 'Enter benefit description',
      },
    ],
    displayFields: ['examinationTypeName', 'benefit'],
    searchFields: ['benefit'],
  },
  language: {
    name: 'Languages',
    singularName: 'Language',
    tableName: 'language',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter language name',
      },
    ],
    displayFields: ['name'],
    searchFields: ['name'],
  },
  organizationType: {
    name: 'Organization Types',
    singularName: 'Organization Type',
    tableName: 'organizationType',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter organization type name',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter description (optional)',
      },
    ],
    displayFields: ['name', 'description'],
    searchFields: ['name', 'description'],
  },
  role: {
    name: 'Roles',
    singularName: 'Role',
    tableName: 'role',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter role name',
      },
    ],
    displayFields: ['name'],
    searchFields: ['name'],
  },
};
