import prisma from "@/lib/db";
import { CaseDetailsData } from "../../types";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import { signClaimantApproveToken } from "@/lib/jwt";
import { ClaimantBookingStatus } from "@prisma/client";

class CaseDetailsService {
  /**
   * Get case details by booking ID
   */
  async getCaseDetails(
    bookingId: string,
    examinerProfileId: string
  ): Promise<CaseDetailsData> {
    const booking = await prisma.claimantBooking.findFirst({
      where: {
        id: bookingId,
        examinerProfileId,
        deletedAt: null,
      },
      include: {
        examination: {
          include: {
            case: {
              include: {
                documents: {
                  include: {
                    document: true,
                  },
                },
              },
            },
            examinationType: true,
            claimant: {
              include: {
                address: true,
                claimType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            insurance: {
              include: {
                address: true,
              },
            },
            legalRepresentative: {
              include: {
                address: true,
              },
            },
            selectedBenefits: {
              include: {
                benefit: true,
              },
            },
          },
        },
        reports: {
          where: {
            deletedAt: null,
          },
          select: {
            status: true,
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const exam = booking.examination;
    const claimant = exam.claimant;
    const insurance = exam.insurance;
    const legalRep = exam.legalRepresentative;

    // Get benefits
    const benefits = exam.selectedBenefits.map((sb) => sb.benefit.benefit);

    // Get documents
    const documents = exam.case.documents
      .filter((cd) => !cd.document.deletedAt)
      .map((cd) => ({
        id: cd.document.id,
        name: cd.document.name,
        displayName: cd.document.displayName,
        type: cd.document.type,
        size: cd.document.size,
      }));

    // Get report status
    const reportStatus = booking.reports?.[0]?.status || null;

    const caseDetails: CaseDetailsData = {
      bookingId: booking.id,
      caseNumber: exam.caseNumber,
      status: booking.status,
      reportStatus,
      claimant: {
        firstName: claimant.firstName,
        lastName: claimant.lastName,
        claimType: claimant.claimType?.name || null,
        dateOfBirth: claimant.dateOfBirth,
        gender: claimant.gender,
        phoneNumber: claimant.phoneNumber,
        emailAddress: claimant.emailAddress,
        address: claimant.address
          ? {
              address: claimant.address.address,
              street: claimant.address.street,
              city: claimant.address.city,
              province: claimant.address.province,
              postalCode: claimant.address.postalCode,
              suite: claimant.address.suite,
            }
          : null,
        familyDoctorName: claimant.familyDoctorName,
        familyDoctorEmailAddress: claimant.familyDoctorEmailAddress,
        familyDoctorPhoneNumber: claimant.familyDoctorPhoneNumber,
        relatedCasesDetails: claimant.relatedCasesDetails,
      },
      insurance: insurance
        ? {
            companyName: insurance.companyName,
            contactPersonName: insurance.contactPersonName,
            emailAddress: insurance.emailAddress,
            phoneNumber: insurance.phoneNumber,
            faxNumber: insurance.faxNumber,
            policyNumber: insurance.policyNumber,
            claimNumber: insurance.claimNumber,
            dateOfLoss: insurance.dateOfLoss,
            policyHolderFirstName: insurance.policyHolderFirstName,
            policyHolderLastName: insurance.policyHolderLastName,
            address: insurance.address
              ? {
                  address: insurance.address.address,
                  street: insurance.address.street,
                  city: insurance.address.city,
                  province: insurance.address.province,
                  postalCode: insurance.address.postalCode,
                  suite: insurance.address.suite,
                }
              : null,
          }
        : null,
      legalRepresentative: legalRep
        ? {
            companyName: legalRep.companyName,
            contactPersonName: legalRep.contactPersonName,
            phoneNumber: legalRep.phoneNumber,
            faxNumber: legalRep.faxNumber,
            address: legalRep.address
              ? {
                  address: legalRep.address.address,
                  street: legalRep.address.street,
                  city: legalRep.address.city,
                  province: legalRep.address.province,
                  postalCode: legalRep.address.postalCode,
                  suite: legalRep.address.suite,
                }
              : null,
          }
        : null,
      examination: {
        examinationType: exam.examinationType.name,
        dueDate: exam.dueDate,
        urgencyLevel: exam.urgencyLevel,
        preference: exam.preference,
        notes: exam.notes,
        additionalNotes: exam.additionalNotes,
        benefits,
      },
      documents,
    };

    return caseDetails;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    examinerProfileId: string,
    status:
      | "ACCEPT"
      | "DECLINE"
      | "REQUEST_MORE_INFO"
      | "DISCARDED"
      | "REPORT_SUBMITTED",
    message?: string
  ): Promise<void> {
    const booking = await prisma.claimantBooking.findFirst({
      where: {
        id: bookingId,
        examinerProfileId,
        deletedAt: null,
      },
      include: {
        examination: {
          include: {
            claimant: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update ClaimantBooking status
    await prisma.claimantBooking.update({
      where: { id: bookingId },
      data: {
        status: status as
          | ClaimantBookingStatus
          | "ACCEPT"
          | "DECLINE"
          | "REQUEST_MORE_INFO"
          | "DISCARDED",
      },
    });

    // // If ACCEPT, update ExaminationSecureLink status to SUBMITTED
    // if (status === "ACCEPT") {
    //   const secureLink = await prisma.examinationSecureLink.findFirst({
    //     where: {
    //       examinationId: booking.examinationId,
    //       deletedAt: null,
    //     },
    //   });

    //   if (secureLink) {
    //     await prisma.examinationSecureLink.update({
    //       where: { id: secureLink.id },
    //       data: { status: "SUBMITTED" },
    //     });
    //   }
    // }

    // Send email to claimant
    if (booking.examination && booking.examination.claimant) {
      const claimant = booking.examination.claimant;
      if (claimant.emailAddress) {
        let templateName: string;
        let subject: string;

        switch (status) {
          case "ACCEPT":
            templateName = "case-accepted.html";
            subject = "Your Case Has Been Accepted";
            break;
          case "DECLINE":
            templateName = "case-declined.html";
            subject = "Case Update - Declined";
            break;
          case "REQUEST_MORE_INFO":
            templateName = "case-request-more-info.html";
            subject = "Additional Information Requested";
            break;
          default:
            return;
        }

        const emailData: Record<string, unknown> = {
          firstName: claimant.firstName,
          lastName: claimant.lastName,
        };

        // Add message/reason for DECLINE and REQUEST_MORE_INFO
        if (status === "DECLINE") {
          emailData.reason = message || "";

          // Generate JWT token for appointment selection
          const examination = booking.examination;
          const claimantEmail = examination.claimant.emailAddress;

          if (claimantEmail) {
            // Generate JWT token with claimant data
            const jwtToken = signClaimantApproveToken(
              {
                email: claimantEmail,
                caseId: examination.caseId,
                examinationId: examination.id,
              },
              "30d"
            );

            emailData.appointmentLink = `${ENV.NEXT_PUBLIC_APP_URL}${ENV.NEXT_PUBLIC_CLAIMANT_AVAILABILITY_URL}?token=${jwtToken}`;
          }
        } else if (status === "REQUEST_MORE_INFO") {
          emailData.message = message || "";
        }

        await emailService.sendEmail(
          subject,
          templateName,
          emailData,
          claimant.emailAddress
        );
      }
    }
  }
}

export const caseDetailsService = new CaseDetailsService();
