"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import authActions from "@/domains/auth/actions";
import { useRegistrationStore } from "@/domains/auth/state/useRegistrationStore";
import { Loader2 } from "lucide-react";

const ResumeApplicationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setIsLoading] = useState(true);
  const { loadExaminerData, setEditMode } = useRegistrationStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Invalid resume link", {
        description: "The resume link is missing a token.",
      });
      router.push("/register");
      return;
    }

    const verifyAndLoad = async () => {
      try {
        setIsLoading(true);

        // Verify token and get application data
        const result = await authActions.verifyResumeToken({ token });

        if (!result.success) {
          const errorMessage =
            "message" in result
              ? result.message
              : "Failed to verify resume token";
          throw new Error(errorMessage);
        }

        if (!("application" in result)) {
          throw new Error("Failed to load application data");
        }

        const application = result.application;
        if (!application) {
          throw new Error("Application data is missing");
        }

        // Check if application is already submitted (not in DRAFT status)
        if (
          application.status !== "DRAFT" &&
          application.status !== "SUBMITTED"
        ) {
          toast.error("Application cannot be resumed", {
            description:
              "This application has already been processed and cannot be edited.",
          });
          router.push("/register");
          return;
        }

        // Map application data to the format expected by loadExaminerData
        const examinerData = {
          id: application.id,
          email: application.email,
          firstName: application.firstName || "",
          lastName: application.lastName || "",
          phone: application.phone || "",
          landlineNumber: application.landlineNumber || "",
          provinceOfResidence: application.province || "",
          mailingAddress: application.address || "",
          address: {
            city: application.city || "",
            street: application.street || "",
            suite: application.suite || "",
            postalCode: application.postalCode || "",
            province: application.province || "",
          },
          languagesSpoken: application.languagesSpoken || [],
          specialties: application.medicalSpecialty || [],
          licenseNumber: application.licenseNumber || "",
          provinceOfLicensure: application.licenseIssuingProvince || "",
          yearsOfIMEExperience: application.yearsOfIMEExperience || "",
          licenseExpiryDate: application.licenseExpiryDate
            ? new Date(application.licenseExpiryDate)
            : null,
          medicalLicenseDocuments: application.medicalLicenseDocuments || [],
          imesCompleted: application.imesCompleted || "",
          currentlyConductingIMEs: application.currentlyConductingIMEs === true,
          assessmentTypeIds: application.assessmentTypes || [],
          redactedIMEReportDocument: null,
          experienceDetails: application.experienceDetails || "",
          isConsentToBackgroundVerification:
            application.consentBackgroundVerification || false,
          agreeToTerms: application.agreeTermsConditions || false,
        };

        // Load the data into the registration store
        // Pass the data directly - loadExaminerData expects examinerData directly, not wrapped
        loadExaminerData(examinerData);
        setEditMode(true, application.id);

        // Wait for Zustand persist to write to localStorage
        // Zustand persist middleware writes asynchronously, so we need to wait
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Show success toast
        toast.success("Application loaded successfully!", {
          description:
            "Your application has been restored. You can continue where you left off.",
          duration: 5000,
        });

        // Use replace instead of push to avoid adding to history
        // This ensures the back button doesn't go back to the resume page
        router.replace("/register");
      } catch (error: any) {
        console.error("Error resuming application:", error);
        toast.error("Failed to resume application", {
          description:
            error?.message ||
            "The resume link may be invalid or expired. Please start a new application.",
        });
        router.push("/register");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [searchParams, router, loadExaminerData, setEditMode]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4FBFF]">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00A8FF]" />
        <p className="mt-4 text-lg text-gray-600">
          Loading your application...
        </p>
      </div>
    </div>
  );
};

const ResumeApplicationPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4FBFF]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00A8FF]" />
            <p className="mt-4 text-lg text-gray-600">
              Loading your application...
            </p>
          </div>
        </div>
      }>
      <ResumeApplicationContent />
    </Suspense>
  );
};

export default ResumeApplicationPage;
