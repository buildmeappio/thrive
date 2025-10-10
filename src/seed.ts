/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

import RoleSeeder from "./seeders/role.seeder";
import OrganizationTypeSeeder from "./seeders/organizationType.seeder";
import DepartmentSeeder from "./seeders/department.seeder";
import AdminSeeder from "./seeders/admin.seeder";
import CaseTypeSeeder from "./seeders/caseType.seeder";
import CaseStatusSeeder from "./seeders/caseStatus.seeder";
import LanguageSeeder from "./seeders/language.seeder";
import ExaminationTypeSeeder from "./seeders/examinationType.seeder";
import ExaminationTypeShortFormSeeder from "./seeders/examTypeShortForm.seeder";
import ClaimTypeSeeder from "./seeders/claimType.seeder";
import ExaminationTypeBenefitSeeder from "./seeders/examinationTypeBenefits.seeder";
import ExaminerProfileSeeder from "./seeders/examinerProfile.seeder";
import CasesSeeder from "./seeders/cases.seeder";

const seeds = [
  RoleSeeder,
  OrganizationTypeSeeder,
  DepartmentSeeder,
  AdminSeeder,
  CaseTypeSeeder,
  CaseStatusSeeder,
  LanguageSeeder,
  ExaminationTypeSeeder,
  ExaminationTypeShortFormSeeder,
  ClaimTypeSeeder,
  ExaminationTypeBenefitSeeder,
  ExaminerProfileSeeder,
  CasesSeeder,
];

const prisma = new PrismaClient();

async function hasRunSeed(name: string) {
  const existing = await prisma.prismaSeed.findFirst({
    where: { name },
  });
  return !!existing;
}

async function markSeedAsRun(name: string) {
  await prisma.prismaSeed.create({
    data: { name, runAt: new Date() },
  });
}

async function main() {
  for (const seed of seeds) {
    console.log("🔍 Checking if seed has run:", seed.name);
    const alreadyRun = await hasRunSeed(seed.name);
    if (alreadyRun) {
      console.log(`Skipping seed (already run): ${seed.name}`);
      continue;
    }

    const instance = seed.getInstance(prisma);
    console.log(`Starting seed: ${seed.name}`);
    try {
      await instance.run();
      await markSeedAsRun(seed.name);
      console.log(`Completed seed: ${seed.name}`);
    } catch (error) {
      console.error(`Error in seed ${seed.name}:`, error);
      throw error;
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
