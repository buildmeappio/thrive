import type { ILoginConfig } from "~/types";

export const LoginConfigs: Record<string, ILoginConfig> = {
  admin: {
    type: "admin",
    title: "Admin Login",
    subtitle: "Access admin dashboard",
  },
  organization: {
    type: "organization",
    title: "Organization Login",
    subtitle: "Access your organization dashboard",
  },
  medicalExaminer: {
    type: "medicalExaminer",
    title: "Medical Examiner Login",
    subtitle: "Access your medical examiner dashboard",
  },
};
