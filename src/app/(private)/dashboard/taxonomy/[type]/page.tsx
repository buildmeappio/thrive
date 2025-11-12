import { Metadata } from "next";
import TaxonomyPage from "@/domains/taxonomy/components/TaxonomyPage";
import { getTaxonomies, getExaminationTypes } from "@/domains/taxonomy/actions";
import { TaxonomyType } from "@/domains/taxonomy/types/Taxonomy";
import { DashboardShell } from "@/layouts/dashboard";
import { notFound } from "next/navigation";
import { TaxonomyConfigs } from "@/domains/taxonomy/config/taxonomyConfig";

const validTypes: TaxonomyType[] = [
  "role",
  "caseType",
  "caseStatus",
  "claimType",
  "department",
  "examinationType",
  "examinationTypeBenefit",
  "language",
  "organizationType",
  "maximumDistanceTravel",
  "yearsOfExperience",
  "configuration",
];

type PageProps = {
  params: {
    type: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  
  // Validate the type parameter
  if (!validTypes.includes(type as TaxonomyType)) {
    return {
      title: "Not Found | Thrive Admin",
      description: "Page not found",
    };
  }

  const config = TaxonomyConfigs[type as TaxonomyType];
  
  return {
    title: `${config.name} | Thrive Admin`,
    description: `Manage ${config.name.toLowerCase()}`,
  };
}

export default async function TaxonomyDynamicPage({ params }: PageProps) {
  const { type } = await params;

  // Validate the type parameter
  if (!validTypes.includes(type as TaxonomyType)) {
    notFound();
  }

  const taxonomyType = type as TaxonomyType;
  const config = TaxonomyConfigs[taxonomyType];

  // Special handling for examination type benefits which needs additional data
  if (taxonomyType === "examinationTypeBenefit") {
    const [benefitsResponse, examinationTypesResponse] = await Promise.all([
      getTaxonomies("examinationTypeBenefit"),
      getExaminationTypes(),
    ]);

    // Check for errors
    if (!benefitsResponse.success) {
      return (
        <DashboardShell>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
                  {config.name}
                </h1>
                
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">
                Error fetching {config.name.toLowerCase()}
              </p>
            </div>
          </div>
        </DashboardShell>
      );
    }

    if (!examinationTypesResponse.success) {
      return (
        <DashboardShell>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
                  {config.name}
                </h1>
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">Error fetching examination types</p>
            </div>
          </div>
        </DashboardShell>
      );
    }

    const data = benefitsResponse.result;
    const examinationTypeOptions = examinationTypesResponse.result;

    return (
      <DashboardShell>
        <TaxonomyPage
          type="examinationTypeBenefit"
          initialData={data}
          examinationTypeOptions={examinationTypeOptions}
        />
      </DashboardShell>
    );
  }

  // Regular taxonomy types
  const response = await getTaxonomies(taxonomyType);

  // Check for errors
  if (!response.success) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
                  {config.name}
                </h1>
              
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">
              Error fetching {config.name.toLowerCase()}
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const data = response.result;

  return (
    <DashboardShell>
      <TaxonomyPage type={taxonomyType} initialData={data} />
    </DashboardShell>
  );
}

// Generate static params for all taxonomy types at build time
export async function generateStaticParams() {
  return validTypes.map((type) => ({
    type: type,
  }));
}
