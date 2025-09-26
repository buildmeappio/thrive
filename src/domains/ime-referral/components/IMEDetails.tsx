'use client';

import * as React from 'react';
import { User, Phone, Mail, MapPin, Briefcase, Shield } from 'lucide-react';
import { type CaseDetailsData } from '../types/CaseDetails';
import { Badge, PriorityBadge, StatusBadge } from '@/components/Badge';

interface IMEDetailsProps {
  caseData: CaseDetailsData;
}

const IMEDetails = ({ caseData }: IMEDetailsProps) => {
  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    const parts = [
      address.suite && `Suite ${address.suite}`,
      address.street,
      address.address,
      address.city,
      address.province,
      address.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full space-y-6">
        {/* Header */}

        <div className="relative z-10">
          <div className="space-y-3">
            <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
              Case Details
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Claimant Information */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center space-x-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Claimant Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="font-medium text-gray-900">{`${caseData.claimant.firstName} ${caseData.claimant.lastName}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">
                      {caseData.claimant.dateOfBirth
                        ? new Date(caseData.claimant.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{caseData.claimant.gender || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{caseData.claimant.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{caseData.claimant.emailAddress || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {formatAddress(caseData.claimant.address)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Doctor Information */}
              {(caseData.claimant.familyDoctorName ||
                caseData.claimant.familyDoctorEmailAddress ||
                caseData.claimant.familyDoctorPhoneNumber) && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Family Doctor</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Doctor Name</label>
                      <p className="text-gray-900">{caseData.claimant.familyDoctorName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-gray-900">
                        {caseData.claimant.familyDoctorPhoneNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">
                        {caseData.claimant.familyDoctorEmailAddress || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fax Number</label>
                      <p className="text-gray-900">
                        {caseData.claimant.familyDoctorFaxNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance Information */}
            {caseData.insurance && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Insurance Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Name</label>
                      <p className="font-medium text-gray-900">{caseData.insurance.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Policy Number</label>
                      <p className="text-gray-900">{caseData.insurance.policyNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Claim Number</label>
                      <p className="text-gray-900">{caseData.insurance.claimNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Loss</label>
                      <p className="text-gray-900">
                        {new Date(caseData.insurance.dateOfLoss).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="text-gray-900">{caseData.insurance.contactPersonName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{caseData.insurance.phoneNumber}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{caseData.insurance.emailAddress}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fax Number</label>
                      <p className="text-gray-900">{caseData.insurance.faxNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Policy Holder Information */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Policy Holder</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{`${caseData.insurance.policyHolderFirstName} ${caseData.insurance.policyHolderLastName}`}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Same as Claimant</label>
                      <Badge
                        variant={
                          caseData.insurance.policyHolderIsClaimant ? 'default' : 'secondary'
                        }
                      >
                        {caseData.insurance.policyHolderIsClaimant ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Insurance Address */}
                {caseData.insurance.address && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Insurance Address</label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {formatAddress(caseData.insurance.address)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legal Representative */}
            {caseData.legalRepresentative && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Legal Representative</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Name</label>
                      <p className="font-medium text-gray-900">
                        {caseData.legalRepresentative.companyName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="text-gray-900">
                        {caseData.legalRepresentative.contactPersonName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">
                          {caseData.legalRepresentative.phoneNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fax Number</label>
                      <p className="text-gray-900">
                        {caseData.legalRepresentative.faxNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {caseData.legalRepresentative.address && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {formatAddress(caseData.legalRepresentative.address)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Summary */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Case Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Case Type</span>
                  <span className="font-medium text-gray-900">
                    {caseData.caseType?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Created Date</span>
                  <span className="text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(caseData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Consent for Submission</span>
                  <Badge variant={caseData.consentForSubmission ? 'default' : 'secondary'}>
                    {caseData.consentForSubmission ? 'Provided' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Draft Status</span>
                  <Badge variant={caseData.isDraft ? 'secondary' : 'default'}>
                    {caseData.isDraft ? 'Draft' : 'Final'}
                  </Badge>
                </div>
              </div>

              {caseData.reason && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-500">Reason for Referral</span>
                    <p className="max-w-xs text-right text-sm text-gray-900">{caseData.reason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Examinations */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Examinations</h2>
                <Badge variant="outline">{caseData.examinations.length}</Badge>
              </div>

              <div className="space-y-6">
                {caseData.examinations.map(exam => (
                  <div
                    key={exam.id}
                    className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {exam.examinationType.name}
                      </h3>
                      <StatusBadge status={exam.status.name} />
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Case Number</span>
                        <span className="font-medium text-gray-900">{exam.caseNumber}</span>
                      </div>
                      {exam.dueDate && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-500">Due Date</span>
                          <span className="text-gray-900">
                            {new Date(exam.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {exam.urgencyLevel && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-500">Priority</span>
                          <PriorityBadge priority={exam.urgencyLevel} />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Support Person</span>
                        <Badge variant={exam.supportPerson ? 'default' : 'secondary'}>
                          {exam.supportPerson ? 'Required' : 'Not Required'}
                        </Badge>
                      </div>
                      {exam.notes && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-medium text-gray-500">Notes</span>
                            <p className="max-w-xs text-right text-sm text-gray-900">
                              {exam.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IMEDetails;
