"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import authActions from "@/domains/auth/actions";
import { useRegistrationStore } from "@/domains/auth/state/useRegistrationStore";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";

const ResumeApplicationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );
  const { loadExaminerData, setEditMode, reset } = useRegistrationStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // Clear localStorage since this is an invalid link
      reset();
      setError({
        title: "Invalid Resume Link",
        message:
          "The resume link is missing a token. Please check your email and try again.",
      });
      setIsLoading(false);
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
          // Clear localStorage for invalid/expired/submitted links
          reset();
          setError({
            title: "Failed to Resume Application",
            message: errorMessage,
          });
          setIsLoading(false);
          return;
        }

        if (!("application" in result)) {
          // Clear localStorage since application data couldn't be loaded
          reset();
          setError({
            title: "Failed to Load Application",
            message:
              "Failed to load application data. Please try again or start a new application.",
          });
          setIsLoading(false);
          return;
        }

        const application = result.application;
        if (!application) {
          // Clear localStorage since application is missing
          reset();
          setError({
            title: "Application Not Found",
            message:
              "Application data is missing. Please start a new application.",
          });
          setIsLoading(false);
          return;
        }

        // Check if application is already submitted (not in DRAFT status)
        if (
          application.status !== "DRAFT" &&
          application.status !== "SUBMITTED"
        ) {
          // Clear localStorage since application cannot be resumed
          reset();
          setError({
            title: "Application Cannot Be Resumed",
            message:
              "This application has already been processed and cannot be edited.",
          });
          setIsLoading(false);
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
      } catch (error: unknown) {
        console.error("Error resuming application:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "The resume link may be invalid or expired. Please start a new application.";
        // Clear localStorage on any error
        reset();
        setError({
          title: "Failed to Resume Application",
          message: errorMessage,
        });
        setIsLoading(false);
      }
    };

    verifyAndLoad();
  }, [searchParams, router, loadExaminerData, setEditMode, reset]);

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4FBFF] px-4">
        <div className="w-full max-w-md rounded-[20px] bg-white p-8 text-center shadow-lg md:rounded-[40px] md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-4 text-2xl font-semibold text-[#140047] md:text-3xl">
            {error.title}
          </h1>
          <p className="mb-8 text-base text-gray-600 md:text-lg">
            {error.message}
          </p>
          <Button
            onClick={() => router.push("/register")}
            className="w-full rounded-full bg-gradient-to-r from-[#89D7FF] to-[#00A8FF] px-8 py-3 text-white hover:opacity-90"
          >
            Start New Application
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
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
  }

  return null;
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
      }
    >
      <ResumeApplicationContent />
    </Suspense>
  );
};

export default ResumeApplicationPage;
