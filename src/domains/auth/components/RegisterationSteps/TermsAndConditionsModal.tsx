"use client";

import React from "react";
import { XIcon } from "lucide-react";

type TermsAndConditionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
}: TermsAndConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <h2 className="text-xl font-bold">📄 Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6 text-[15px] leading-relaxed text-gray-700 text-justify">
            <p>
              These Terms & Conditions (&quot;Terms&quot;) govern your use of
              the Thrive Assessment & Care platform and services. By accessing
              Thrive, you agree to comply with and be bound by these Terms.
            </p>

            <div>
              <div className="mb-2 font-semibold">1. Platform Purpose</div>
              <p>
                Thrive is a B2B software platform designed to facilitate
                Independent Medical Examinations (IMEs) for insurers, healthcare
                providers, legal professionals, and claimants.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">2. Account Registration</div>
              <p>You must:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Be authorized by your organization to use Thrive</li>
                <li>Provide accurate, current information</li>
                <li>Maintain the confidentiality of your login credentials</li>
              </ul>
              <p className="mt-2">
                Thrive is not responsible for unauthorized account usage
                resulting from lost or shared credentials.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">3. Acceptable Use</div>
              <p>You agree not to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>
                  Use the platform to share false, defamatory, or illegal
                  content
                </li>
                <li>
                  Interfere with system operations or access other users&apos;
                  data
                </li>
                <li>
                  Bypass security features or use unauthorized integrations
                </li>
              </ul>
              <p className="mt-2">
                Violations may result in suspension or termination of access.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">4. User Responsibilities</div>
              <p>As a user, you are responsible for:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>
                  Ensuring the accuracy and legality of uploaded case data
                </li>
                <li>
                  Respecting the confidentiality of all reports and personal
                  information
                </li>
                <li>
                  Using the platform only for its intended professional purposes
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">5. Data Ownership</div>
              <p>
                You (or your organization) retain ownership of data you upload.
                By using Thrive, you grant us permission to store, process, and
                share data as necessary to fulfill IME functions.
              </p>
              <p className="mt-2">
                Thrive may anonymize and aggregate usage data to improve
                platform performance and insights.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">6. Service Availability</div>
              <p>
                We strive for 99.9% uptime, but do not guarantee uninterrupted
                service. Maintenance, updates, or force majeure events may cause
                temporary disruptions.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">7. Intellectual Property</div>
              <p>
                All Thrive software, branding, and materials are the
                intellectual property of Thrive Assessment & Care and may not be
                copied, modified, or redistributed without permission.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">
                8. Limitation of Liability
              </div>
              <p>
                To the fullest extent permitted by law, Thrive is not liable
                for:
              </p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Errors in third-party medical or legal evaluations</li>
                <li>
                  Damages resulting from platform unavailability or user error
                </li>
                <li>Loss of data caused by actions outside our control</li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">9. Indemnification</div>
              <p>
                You agree to indemnify Thrive and its affiliates from any claim
                arising from your misuse of the platform or violation of these
                Terms.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">10. Governing Law</div>
              <p>
                These Terms are governed by the laws of Ontario, Canada.
                Disputes shall be handled in Ontario courts.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">11. Modifications</div>
              <p>
                We may update these Terms from time to time. Continued use of
                the platform indicates acceptance of revised Terms.
              </p>
            </div>

            <div className="mt-8 border-t pt-3 pb-1">
              <div className="font-medium">Contact</div>
              <p className="mt-2">For questions or concerns:</p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>📍 Thrive Assessment & Care</strong>
                </p>
                <p>
                  1 Dundas Street West, Suite 2500, Toronto, Ontario, M5G 1Z3
                </p>
                <p>
                  📩{" "}
                  <a
                    href="mailto:info@thriveassessmentcare.com"
                    className="text-[#00A8FF] underline hover:decoration-[#0088CC]">
                    info@thriveassessmentcare.com
                  </a>
                </p>
                <p>📞 (647) 417-7275</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
