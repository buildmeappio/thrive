'use client';

import React from 'react';
import { XIcon } from 'lucide-react';

type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <h2 className="text-xl font-bold">🔐 Privacy Policy</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6 text-justify text-[15px] leading-relaxed text-gray-700">
            <p>
              At Thrive Assessment & Care (&quot;Thrive,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;), we are committed to protecting the privacy and confidentiality of
              our users&apos; information, including that of insurance professionals, legal
              representatives, medical assessors, and claimants.
            </p>
            <p>
              This Privacy Policy outlines how we collect, use, disclose, and safeguard your
              information in accordance with applicable privacy laws, including PIPEDA (Canada) and
              HIPAA (U.S.).
            </p>

            <div>
              <div className="mb-2 font-semibold">1. Scope of Policy</div>
              <p>This policy applies to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>All users accessing the Thrive platform (web and mobile)</li>
                <li>
                  Information exchanged between insurance companies, legal counsels, healthcare
                  providers, and claimants
                </li>
                <li>Communication via Thrive&apos;s platform, email, or integrations</li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">2. Information We Collect</div>
              <p>We may collect the following types of data:</p>
              <div className="mb-2">
                <span className="font-semibold">Personal Information:</span> Name, email, phone
                number, company, role
              </div>
              <div className="mb-2">
                <span className="font-semibold">Case Data:</span> Claimant details, medical history,
                IME scheduling and reports
              </div>
              <div className="mb-2">
                <span className="font-semibold">Usage Data:</span> Device type, browser, IP address,
                time spent on platform
              </div>
              <div className="mb-2">
                <span className="font-semibold">Communication Logs:</span> Emails, messages, file
                attachments
              </div>
              <p className="mt-2">
                We only collect information necessary for facilitating and managing the IME process.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">3. How We Use Your Information</div>
              <p>We use your data to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Create and manage IME cases</li>
                <li>Coordinate scheduling between stakeholders</li>
                <li>Facilitate secure file sharing and messaging</li>
                <li>Generate analytics and audit trails for compliance</li>
                <li>Improve platform performance and user experience</li>
                <li>Enforce platform security and integrity</li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">4. Legal Basis for Data Processing</div>
              <p>Thrive processes data under lawful bases:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>
                  <span className="font-semibold">Consent:</span> When users create accounts or
                  upload data voluntarily
                </li>
                <li>
                  <span className="font-semibold">Contractual Obligation:</span> To fulfill IME
                  coordination duties
                </li>
                <li>
                  <span className="font-semibold">Legal Compliance:</span> To meet regulatory and
                  audit requirements
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">5. Data Sharing & Disclosure</div>
              <p>We may share data with:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Healthcare providers assigned to a case</li>
                <li>Insurers, legal teams, and claimants involved in a case</li>
                <li>Service providers (e.g., cloud storage, security vendors)</li>
              </ul>
              <p className="mt-2">We do not sell personal data to any third party.</p>
            </div>

            <div>
              <div className="mb-2 font-semibold">6. Data Storage & Security</div>
              <p>
                All data is stored on secure, encrypted servers compliant with PIPEDA and HIPAA.
              </p>
              <p className="mt-2">
                Multi-factor authentication, role-based access control, and regular security audits
                are enforced.
              </p>
              <p className="mt-2">Backups and disaster recovery protocols are in place.</p>
            </div>

            <div>
              <div className="mb-2 font-semibold">7. User Rights</div>
              <p>As a user, you have the right to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Access your information</li>
                <li>Request corrections</li>
                <li>Withdraw consent (where applicable)</li>
                <li>File a complaint with your regional data authority</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us at:{' '}
                <a
                  href="mailto:privacy@thriveassessmentcare.com"
                  className="text-[#00A8FF] underline hover:decoration-[#0088CC]"
                >
                  privacy@thriveassessmentcare.com
                </a>
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">8. Cookies & Tracking</div>
              <p>We use cookies to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Analyze site usage</li>
                <li>Remember login sessions</li>
                <li>Improve navigation</li>
              </ul>
              <p className="mt-2">
                You may manage cookies in your browser settings. Disabling cookies may impact
                functionality.
              </p>
            </div>

            <div>
              <div className="mb-2 font-semibold">9. Data Retention</div>
              <p>Data is retained only for as long as necessary to:</p>
              <ul className="ml-6 mt-1 list-disc">
                <li>Fulfill IME-related obligations</li>
                <li>Meet regulatory requirements</li>
                <li>Resolve potential disputes</li>
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">10. Changes to This Policy</div>
              <p>
                Thrive reserves the right to update this policy. Users will be notified of
                significant changes via email or in-platform messaging.
              </p>
            </div>

            <div className="mt-8 border-t pb-1 pt-3">
              <div className="font-medium">Contact Us</div>
              <p className="mt-2">If you have any questions or concerns, please contact:</p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>📍 Thrive Assessment & Care</strong>
                </p>
                <p>1 Dundas Street West, Suite 2500, Toronto, Ontario, M5G 1Z3</p>
                <p>
                  📩{' '}
                  <a
                    href="mailto:info@thriveassessmentcare.com"
                    className="text-[#00A8FF] underline hover:decoration-[#0088CC]"
                  >
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
