/* eslint-disable no-console */
import prisma from './db';

import RoleSeeder from './seeders/role.seeder';
import OrganizationTypeSeeder from './seeders/organizationType.seeder';
import DepartmentSeeder from './seeders/department.seeder';
import AdminSeeder from './seeders/admin.seeder';
import CaseTypeSeeder from './seeders/caseType.seeder';
import CaseStatusSeeder from './seeders/caseStatus.seeder';
import LanguageSeeder from './seeders/language.seeder';
// import InterpreterSeeder from "./seeders/interpreter.seeder";
import ExaminationTypeSeeder from './seeders/examinationType.seeder';
import ExaminationTypeShortFormSeeder from './seeders/examTypeShortForm.seeder';
import ClaimTypeSeeder from './seeders/claimType.seeder';
import ExaminationTypeBenefitSeeder from './seeders/examinationTypeBenefits.seeder';
import ExaminerProfileSeeder from './seeders/examinerProfile.seeder';
import CasesSeeder from './seeders/cases.seeder';
import AdditionalCaseStatusSeeder from './seeders/additionalCaseStatus.seeder';
import TransporterSeeder from './seeders/transporter.seeder';
import ChaperoneSeeder from './seeders/chaperone.seeder';
import MaximumDistanceTravelSeeder from './seeders/maximumDistanceTravel.seeder';
import YearsOfExperienceSeeder from './seeders/yearsOfExperience.seeder';
import ConfigurationSeeder from './seeders/configuration.seeder';
import AssessmentTypeSeeder from './seeders/assessmentType.seeder';
import DevSuperAdminSeeder from './seeders/devSuperAdmin.seeder';
import ProfessionalTitleSeeder from './seeders/professionalTitle.seeder';
import EmailTemplateSeeder from './seeders/emailTemplate.seeder';
import CustomVariableSeeder from './seeders/customVariable.seeder';
import OrganizationWebPermissionsSeeder from './seeders/organizationWebPermissions.seeder';
import MigrateRolesToOrganizationSpecificSeeder from './seeders/migrateRolesToOrganizationSpecific.seeder';

const seeds = [
  RoleSeeder,
  OrganizationTypeSeeder,
  DepartmentSeeder,
  AdminSeeder,
  CaseTypeSeeder,
  CaseStatusSeeder,
  AdditionalCaseStatusSeeder,
  LanguageSeeder,
  // InterpreterSeeder,
  ExaminationTypeSeeder,
  ExaminationTypeShortFormSeeder,
  ClaimTypeSeeder,
  ExaminationTypeBenefitSeeder,
  ExaminerProfileSeeder,
  CasesSeeder,
  TransporterSeeder,
  ChaperoneSeeder,
  MaximumDistanceTravelSeeder,
  YearsOfExperienceSeeder,
  ConfigurationSeeder,
  AssessmentTypeSeeder,
  DevSuperAdminSeeder,
  ProfessionalTitleSeeder,
  EmailTemplateSeeder,
  CustomVariableSeeder,
  OrganizationWebPermissionsSeeder,
  MigrateRolesToOrganizationSpecificSeeder,
];

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
    console.log('🔍 Checking if seed has run:', seed.name);
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
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
