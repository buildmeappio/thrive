import { SubmitExaminerApplicationInput } from "../../types";
import authService from "../auth.service";
import AuthDto from "../dto/auth.dto";
import prisma from "@/lib/db";

const submitExaminerApplication = async (payload: SubmitExaminerApplicationInput) => {
  const app = await authService.submitExaminerApplication(payload);

  // include profile+docs for DTO mapping
  const full = await prisma.examinerApplication.findUnique({
    where: { id: app.id },
    include: {
      profile: {
        include: {
          documents: { include: { document: true } },
        },
      },
    },
  });

  if (!full) throw new Error("Application not found after creation");
  return AuthDto.toApplicationDto(full);
};

export default submitExaminerApplication;
