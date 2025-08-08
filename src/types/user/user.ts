export type UserRole = "ADMIN" | "ORGANIZATION" | "MEDICAL_EXAMINER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone: string;
  licenseNumber: string;
  isVerified: boolean;
}

export interface MedicalExaminer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  availability: string[];
  isVerified: boolean;
}
