import { formatDate, formatDateTime } from '@/shared/utils/dateTime';
import getReferralDetails from '@/domains/ime-referral/server/handlers/getReferralDetails';
import { type Metadata } from 'next';
import { type ReferralDetailsData } from '@/domains/ime-referral/types/referral';
import { snakeToTitleCase } from '@/shared/utils/snakeToTitleCase';

export const metadata: Metadata = {
  title: 'Referral Details | Thrive',
  description: 'Referral Details - Thrive',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ReferralDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const referralDetails = await getReferralDetails(id);
  const referral: ReferralDetailsData = referralDetails.result;

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30';
      case 'LOW':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'SUBMITTED':
        return 'bg-[#000093] text-white shadow-lg shadow-blue-500/30';
      case 'PENDING':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30';
      case 'REJECTED':
      case 'INVALID':
        return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/30';
    }
  };

  return (
    <div className="">
      <div className="space-y-8">
        {/* Header */}
        <div className="">
          <div className="">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-semibold text-transparent">
                      Referral Details
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${referral.isDraft ? 'bg-[#000093] text-gray-800 shadow-md' : 'bg-[#000093] text-white shadow-lg shadow-blue-500/30'}`}
                >
                  {referral.isDraft ? 'Draft' : 'Submitted'}
                </span>
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${referral.consentForSubmission ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'}`}
                >
                  {referral.consentForSubmission ? 'Consent Given' : 'Consent Pending'}
                </span>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600">
              <span className="font-medium">Submitted at: </span>{' '}
              {formatDateTime(referral.createdAt)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Organization Details */}
          {referral.organization && (
            <div className="rounded-lg border border-gray-200 shadow-sm">
              <div className="rounded-t-lg border-b border-gray-200 bg-[#000093] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-[#FFFFFF]">Organization</h2>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {referral.organization.name.charAt(0).toUpperCase() +
                      referral.organization.name.slice(1)}
                  </h3>
                  <p className="text-gray-600">
                    {snakeToTitleCase(referral.organization.type.name)}
                  </p>
                  {referral.organization.website && (
                    <a
                      href={referral.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getStatusBadgeColor(referral.organization.status)}`}
                  >
                    {referral.organization.status}
                  </span>
                  {referral.organization.isAuthorized && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Authorized
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Address
                  </h4>
                  <div className="text-sm text-gray-700">
                    <p>{referral.organization.address.address}</p>
                    <p>
                      {referral.organization.address.city}, {referral.organization.address.province}{' '}
                      {referral.organization.address.postalCode}
                    </p>
                  </div>
                </div>

                {referral.organization.manager.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      Managers
                    </h4>
                    <div className="space-y-3">
                      {referral.organization.manager.map(manager => (
                        <div key={manager.id} className="rounded-lg border border-gray-200 p-3">
                          <p className="font-medium text-gray-900">
                            {manager.account.user.firstName} {manager.account.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {manager.department &&
                              `${snakeToTitleCase(manager.department.name)} Department`}
                          </p>
                          <p className="text-sm text-blue-600">{manager.account.user.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claimant Details */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="rounded-t-lg border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-300">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#FFFFFF]">Claimant</h2>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {referral.claimant.firstName} {referral.claimant.lastName}
                </h3>
                <p className="text-gray-600">{referral.claimant.gender}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                  </div>
                  <p className="text-gray-700">{formatDate(referral.claimant.dateOfBirth)}</p>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                  </div>
                  <p className="text-gray-700">{referral.claimant.phoneNumber}</p>
                </div>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-medium text-gray-900">Email</p>
                </div>
                <p className="text-gray-700">{referral.claimant.emailAddress}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address
                </h4>
                <div className="text-sm text-gray-700">
                  <p>{referral.claimant.address.address}</p>
                  <p>
                    {referral.claimant.address.city}, {referral.claimant.address.province}{' '}
                    {referral.claimant.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases */}
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white shadow-xl">
          <div className="bg-[#000093] px-8 py-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Cases</h2>
            </div>
          </div>

          <div>
            {referral.cases.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">
                  No cases found for this referral
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {referral.cases.map(caseItem => (
                  <div key={caseItem.id} className="relative">
                    <div className="p-8">
                      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            Case #{caseItem.caseNumber}
                          </h3>
                          <p className="text-lg font-medium text-gray-600">
                            {caseItem.caseType.name}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-xl px-4 py-2 text-sm font-bold ${getUrgencyBadgeColor(caseItem.urgencyLevel)}`}
                          >
                            🚨 {caseItem.urgencyLevel}
                          </span>
                          <span
                            className={`rounded-xl px-4 py-2 text-sm font-bold ${getStatusBadgeColor(caseItem.status.name)}`}
                          >
                            {caseItem.status.name}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                          <p className="mb-2 text-sm font-bold text-blue-600">📋 Exam Format</p>
                          <p className="font-medium text-gray-900">{caseItem.examFormat.name}</p>
                        </div>
                        <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                          <p className="mb-2 text-sm font-bold text-green-600">🏥 Specialty</p>
                          <p className="font-medium text-gray-900">
                            {caseItem.requestedSpecialty.name}
                          </p>
                        </div>
                        {caseItem.preferredLocation && (
                          <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                            <p className="mb-2 text-sm font-bold text-purple-600">
                              📍 Preferred Location
                            </p>
                            <p className="font-medium text-gray-900">
                              {caseItem.preferredLocation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mb-6 rounded-xl border border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                        <p className="mb-3 text-sm font-bold text-orange-600">💭 Reason</p>
                        <p className="leading-relaxed text-gray-900">{caseItem.reason}</p>
                      </div>

                      {caseItem.examiner && (
                        <div className="mb-6 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                          <p className="mb-3 text-sm font-bold text-green-600">
                            👨‍⚕️ Assigned Examiner
                          </p>
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-gray-900">
                              {caseItem.examiner.user.firstName} {caseItem.examiner.user.lastName}
                            </p>
                            <p className="font-medium text-gray-600">
                              {caseItem.examiner.user.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {caseItem.documents.length > 0 && (
                        <div className="mb-6 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-6">
                          <p className="mb-4 text-sm font-bold text-gray-600">
                            📄 Documents ({caseItem.documents.length})
                          </p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {caseItem.documents.map(doc => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                              >
                                <span className="font-medium text-gray-900">
                                  {doc.document.name}
                                </span>
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                  {doc.document.type} • {(doc.document.size / 1024).toFixed(1)}KB
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">Submitted at:</span>{' '}
                            {formatDateTime(caseItem.createdAt)}
                          </div>
                          {caseItem.assignedAt && (
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="font-medium">Assigned:</span>{' '}
                              {formatDateTime(caseItem.assignedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Claimant Availability */}
        {referral.claimant.claimantAvailability.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/50 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Claimant Availability</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                {referral.claimant.claimantAvailability.map((availability, index) => (
                  <div key={availability.id} className="relative">
                    <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
                      <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-lg">
                        {index + 1}
                      </div>

                      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <span className="text-2xl font-bold text-gray-900">
                            Preference: {availability.preference}
                          </span>
                        </div>
                        {availability.consentAck && (
                          <span className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
                            ✅ Consent Acknowledged
                          </span>
                        )}
                      </div>

                      {availability.slots.length > 0 && (
                        <div className="mb-6">
                          <div className="mb-4 flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-teal-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="font-bold text-gray-900">Available Time Slots</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {availability.slots.map(slot => (
                              <div
                                key={slot.id}
                                className="rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 shadow-sm"
                              >
                                <div className="mb-2 font-bold text-gray-900">
                                  {formatDate(slot.date)}
                                </div>
                                <div className="space-y-1 text-gray-700">
                                  <p className="font-medium">
                                    🕐 {slot.startTime} - {slot.endTime}
                                  </p>
                                  <p className="rounded bg-white px-2 py-1 text-sm font-medium text-teal-700">
                                    {slot.timeBand}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {availability.services.length > 0 && (
                        <div className="mb-6">
                          <div className="mb-4 flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                              />
                            </svg>
                            <p className="font-bold text-gray-900">Required Services</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {availability.services
                              .filter(service => service.enabled)
                              .map(service => (
                                <div
                                  key={service.id}
                                  className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4 shadow-sm"
                                >
                                  <div className="space-y-2">
                                    <span className="text-lg font-bold text-gray-900">
                                      {service.type}
                                    </span>
                                    {service.interpreter && (
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <svg
                                          className="h-4 w-4 text-blue-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                          />
                                        </svg>
                                        <span className="font-medium">
                                          Language: {service.interpreter.language.name}
                                        </span>
                                      </div>
                                    )}
                                    {service.transport && service.transport.notes && (
                                      <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2">
                                        <p className="text-sm text-gray-700">
                                          {service.transport.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {(availability.accessibilityNotes || availability.additionalNotes) && (
                        <div className="space-y-4">
                          {availability.accessibilityNotes && (
                            <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                              <div className="mb-3 flex items-center gap-2">
                                <svg
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <p className="font-bold text-blue-600">Accessibility Notes</p>
                              </div>
                              <p className="leading-relaxed text-gray-900">
                                {availability.accessibilityNotes}
                              </p>
                            </div>
                          )}
                          {availability.additionalNotes && (
                            <div className="rounded-xl border border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                              <div className="mb-3 flex items-center gap-2">
                                <svg
                                  className="h-5 w-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                <p className="font-bold text-orange-600">Additional Notes</p>
                              </div>
                              <p className="leading-relaxed text-gray-900">
                                {availability.additionalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDetails;
