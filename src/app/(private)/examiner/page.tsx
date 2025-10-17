import ExaminerPageContent from "./ExaminerPageContent";
import { listAllExaminers, listExaminerSpecialties, listExaminerStatuses } from "@/domains/examiner/actions";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Examiner | Thrive Admin",
  description: "Medical Examiner",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [examiners, specialties, statuses] = await Promise.all([
    listAllExaminers(),
    listExaminerSpecialties(),
    listExaminerStatuses(),
  ]);

  const data: ExaminerData[] = examiners.map((examiner) => ({
    id: examiner.id,
    name: examiner.name,
    specialties: examiner.specialties,
    phone: examiner.phone,
    email: examiner.email,
    province: examiner.province,
    mailingAddress: examiner.mailingAddress,
    licenseNumber: examiner.licenseNumber,
    provinceOfLicensure: examiner.provinceOfLicensure,
    licenseExpiryDate: examiner.licenseExpiryDate,
    cvUrl: examiner.cvUrl,
    medicalLicenseUrl: examiner.medicalLicenseUrl,
    languagesSpoken: examiner.languagesSpoken,
    yearsOfIMEExperience: examiner.yearsOfIMEExperience,
    experienceDetails: examiner.experienceDetails,
    insuranceProofUrl: examiner.insuranceProofUrl,
    signedNdaUrl: examiner.signedNdaUrl,
    status: examiner.status,
    createdAt: examiner.createdAt,
    updatedAt: examiner.updatedAt,
  }));

  return <ExaminerPageContent data={data} specialties={specialties} statuses={statuses} />;
};

export default Page;
