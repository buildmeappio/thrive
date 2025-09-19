import { formatDate, formatDateTime } from '@/utils/dateTime';
import getReferralDetails from '@/domains/ime-referral/server/handlers/getReferralDetails';
import { type Metadata } from 'next';
import { snakeToTitleCase } from '@/utils/snakeToTitleCase';
import type { ReferralDetailsData } from '@/domains/ime-referral/types/referrals';

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
    <div>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Referral Details</h1>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  referral.isDraft
                    ? 'bg-yellow-100 text-yellow-800 shadow-md'
                    : 'bg-[#000093] text-white shadow-lg shadow-blue-500/30'
                }`}
              >
                {referral.isDraft ? 'Draft' : 'Submitted'}
              </span>
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  referral.consentForSubmission
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                }`}
              >
                {referral.consentForSubmission ? 'Consent Given' : 'Consent Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Organization Details */}
          {referral.organization && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="rounded-t-2xl border-b border-gray-200 bg-[#000093] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <svg
                      className="h-6 w-6 text-white"
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
                  <h2 className="text-xl font-semibold text-white">Organization</h2>
                </div>
              </div>

              <div className="space-y-6 p-6">
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
                      className="mt-2 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
                    >
                      Visit Website
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h4m6 0a2 2 0 002-2v-6m-6 0V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-6z"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${getStatusBadgeColor(referral.organization.status)}`}
                  >
                    {referral.organization.status}
                  </span>
                  {referral.organization.isAuthorized && (
                    <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Authorized
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                    <svg
                      className="h-5 w-5 text-gray-500"
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
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>{referral.organization.address.address}</p>
                    <p>
                      {referral.organization.address.city}, {referral.organization.address.province}{' '}
                      {referral.organization.address.postalCode}
                    </p>
                  </div>
                </div>

                {referral.organization.manager && referral.organization.manager.length > 0 && (
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
                      <svg
                        className="h-5 w-5 text-gray-500"
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
                        <div
                          key={manager.id}
                          className="rounded-xl border border-gray-200 bg-white p-4"
                        >
                          <p className="font-semibold text-gray-900">
                            {manager.account.user.firstName} {manager.account.user.lastName}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {manager.department &&
                              `${snakeToTitleCase(manager.department.name)} Department`}
                            {manager.jobTitle && ` • ${manager.jobTitle}`}
                          </p>
                          <p className="mt-1 text-sm text-blue-600">{manager.account.user.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claimant Details */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    className="h-6 w-6 text-white"
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
                <h2 className="text-xl font-semibold text-white">Claimant</h2>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
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
                <h3 className="text-2xl font-semibold text-gray-900">
                  {referral.claimant.firstName} {referral.claimant.lastName}
                </h3>
                <p className="text-gray-600 capitalize">{referral.claimant.gender.toLowerCase()}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
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
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-gray-900">Date of Birth</p>
                  </div>
                  <p className="text-gray-700">{formatDate(referral.claimant.dateOfBirth)}</p>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-green-600"
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
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                  </div>
                  <p className="text-gray-700">{referral.claimant.phoneNumber}</p>
                </div>
              </div>

              <div className="rounded-xl bg-purple-50 p-4">
                <div className="mb-2 flex items-center gap-2">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-semibold text-gray-900">Email</p>
                </div>
                <p className="text-gray-700">{referral.claimant.emailAddress}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                  <svg
                    className="h-5 w-5 text-gray-500"
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
                <div className="space-y-1 text-sm text-gray-700">
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

        {/* Examinations */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-[#000093] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <svg
                  className="h-6 w-6 text-white"
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
              <h2 className="text-xl font-bold text-white">Cases</h2>
            </div>
          </div>

          <div>
            {referral.examinations.length === 0 ? (
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
                  No examinations found for this referral
                </p>
              </div>
            ) : (
              <div className="space-y-8 p-8">
                {referral.examinations.map(examination => (
                  <div key={examination.id} className="relative">
                    <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Case #{examination.caseNumber}
                        </h3>
                        <p className="text-lg font-medium text-gray-600">
                          {examination.examinationType?.name || 'No type specified'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${getUrgencyBadgeColor(examination.urgencyLevel)}`}
                        >
                          {examination.urgencyLevel}
                        </span>
                        <span
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${getStatusBadgeColor(examination.status.name)}`}
                        >
                          {examination.status.name}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 rounded-xl border border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                      <p className="mb-3 text-sm font-bold text-orange-600">Reason</p>
                      <p className="leading-relaxed text-gray-900">{examination.reason}</p>
                    </div>

                    {examination.dueDate && (
                      <div className="mb-6 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                        <p className="mb-3 text-sm font-bold text-purple-600">Due Date</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDate(examination.dueDate)}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-6">
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
                          <span className="font-medium">Created:</span>{' '}
                          {formatDateTime(examination.createdAt)}
                        </div>
                        {examination.assignedAt && (
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
                            {formatDateTime(examination.assignedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Case Type and Exam Type Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {referral.examType && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Examination Types</h2>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{referral.examType.name}</h3>
              </div>
            </div>
          )}
        </div>

        {/* Insurance Details */}
        {referral.insurance && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Insurance</h2>
              </div>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {referral.insurance.companyName}
                </h3>
                <p className="text-gray-600">Contact: {referral.insurance.contactPersonName}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Policy Number</p>
                  <p className="text-gray-700">{referral.insurance.policyNumber}</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Claim Number</p>
                  <p className="text-gray-700">{referral.insurance.claimNumber}</p>
                </div>
              </div>

              <div className="rounded-xl bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Date of Loss</p>
                <p className="text-gray-700">{formatDate(referral.insurance.dateOfLoss)}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                  <svg
                    className="h-5 w-5 text-gray-500"
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
                <div className="space-y-1 text-sm text-gray-700">
                  <p>{referral.insurance.address.address}</p>
                  <p>
                    {referral.insurance.address.city}, {referral.insurance.address.province}{' '}
                    {referral.insurance.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Representative Details */}
        {referral.legalRepresentative && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Legal Representative</h2>
              </div>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {referral.legalRepresentative.companyName}
                </h3>
                <p className="text-gray-600">
                  Contact: {referral.legalRepresentative.contactPersonName}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">{referral.legalRepresentative.phoneNumber}</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Fax</p>
                  <p className="text-gray-700">{referral.legalRepresentative.faxNumber}</p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                  <svg
                    className="h-5 w-5 text-gray-500"
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
                <div className="space-y-1 text-sm text-gray-700">
                  <p>{referral.legalRepresentative.address.address}</p>
                  <p>
                    {referral.legalRepresentative.address.city},{' '}
                    {referral.legalRepresentative.address.province}{' '}
                    {referral.legalRepresentative.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {referral.documents && referral.documents.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    className="h-6 w-6 text-white"
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
                <h2 className="text-xl font-bold text-white">
                  Documents ({referral.documents.length})
                </h2>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {referral.documents.map(docRef => (
                  <div
                    key={docRef.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                        <svg
                          className="h-6 w-6 text-indigo-600"
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
                      <div>
                        <p className="font-semibold text-gray-900">{docRef.document.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            {docRef.document.type}
                          </span>
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                            {(docRef.document.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg bg-indigo-100 p-2 transition-colors hover:bg-indigo-200">
                      <svg
                        className="h-4 w-4 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
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
