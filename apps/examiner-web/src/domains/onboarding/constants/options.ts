const imeCompletionOptions = [
  { value: '0-10', label: '0-10' },
  { value: '11-25', label: '11-25' },
  { value: '26-50', label: '26-50' },
  { value: '51+', label: '51+' },
];

const formatOptions = [
  { value: 'in_person', label: 'In-person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'both', label: 'Both' },
];

const bufferOptions = [
  { value: '0', label: 'No buffer' },
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
];

const advanceBookingOptions = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
];

const appointmentDurationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '120 minutes' },
];

const minimumNoticeUnitOptions = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
];

const MAX_IMES_PER_WEEK_OPTIONS = [
  { value: '1-3', label: '1-3' },
  { value: '3-5', label: '3-5' },
  { value: '5-10', label: '5-10' },
  { value: '10+', label: '10+' },
];

const MINIMUM_NOTICE_OPTIONS = [
  { value: '24', label: '24h' },
  { value: '48', label: '48h' },
  { value: '72', label: '72h' },
];

export {
  imeCompletionOptions,
  formatOptions,
  advanceBookingOptions,
  appointmentDurationOptions,
  bufferOptions,
  minimumNoticeUnitOptions,
  MAX_IMES_PER_WEEK_OPTIONS,
  MINIMUM_NOTICE_OPTIONS,
};
