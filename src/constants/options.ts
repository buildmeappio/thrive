// Single source of truth for Canadian provinces and territories
// Now using the 'canada' library as the source of truth
import { getProvinceOptions } from "@/utils/canadaData";

export type Province = {
  value: string;
  label: string;
};

// Get provinces from the canada library (dynamically loaded)
export const provinces: Province[] = getProvinceOptions();

export const daysOptions = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export const timeOptions = [
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "11:59 PM",
];

export const medicalSpecialtyOptions = [
  { value: "anesthesiology", label: "Anesthesiology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "emergency-medicine", label: "Emergency Medicine" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "family-medicine", label: "Family Medicine" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "general-surgery", label: "General Surgery" },
  { value: "gynecology", label: "Gynecology" },
  { value: "hematology", label: "Hematology" },
  { value: "infectious-diseases", label: "Infectious Diseases" },
  { value: "internal-medicine", label: "Internal Medicine" },
  { value: "nephrology", label: "Nephrology" },
  { value: "neurology", label: "Neurology" },
  { value: "neurosurgery", label: "Neurosurgery" },
  { value: "obstetrics", label: "Obstetrics" },
  { value: "oncology", label: "Oncology" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "orthopedic-surgery", label: "Orthopedic Surgery" },
  { value: "otolaryngology", label: "Otolaryngology (ENT)" },
  { value: "pathology", label: "Pathology" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "plastic-surgery", label: "Plastic Surgery" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "radiology", label: "Radiology" },
  { value: "rheumatology", label: "Rheumatology" },
  { value: "urology", label: "Urology" },
  { value: "vascular-surgery", label: "Vascular Surgery" },
  { value: "other", label: "Other" },
];
