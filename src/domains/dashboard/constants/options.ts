const assessmentTypeOptions = [
  { value: "disability", label: "Disability" },
  { value: "wsib", label: "WSIB" },
  { value: "mva", label: "MVA" },
  { value: "ltd", label: "LTD" },
  { value: "cpp", label: "CPP" },
];

const formatOptions = [
  { value: "in_person", label: "In-person" },
  { value: "virtual", label: "Virtual" },
  { value: "both", label: "Both" },
];

const bufferTimeOptions = [
  { value: "0", label: "No buffer" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
];

const advanceBookingOptions = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

export {
  assessmentTypeOptions,
  formatOptions,
  bufferTimeOptions,
  advanceBookingOptions,
};
