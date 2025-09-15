'use client';
import React, { useState, type JSX } from 'react';
import RequestMoreInfo from './RequestMoreInfo';
import RejectReason from './RejectReason';
import { IReviewExaminerAction, IReviewExaminerField } from '@/shared/types';
import {
  actions,
  examinerData,
  experienceDetails,
  imeExperience,
  legalCompliance,
  medicalCredentials,
  personalContactInfo,
} from '@/shared/config/admindashboard/examiner/ReviewExaminersData';

const ReviewExaminer: React.FC = () => {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const handleDownload = (fileName: string): void => {
    console.log(`Downloading ${fileName}`);
  };

  const handleActionClick = (actionLabel: string): void => {
    console.log(`${actionLabel} clicked`);
    if (actionLabel === 'Request More Info') {
      setIsRequestOpen(true);
    } else if (actionLabel === 'Reject Examiner') {
      setIsRejectOpen(true);
    }
  };

  const renderField = (item: IReviewExaminerField, index: number): JSX.Element => (
    <div
      key={index}
      className="flex items-center justify-between rounded-lg px-4 py-3"
      style={{ backgroundColor: '#F6F6F6' }}
    >
      <span className="font-medium text-gray-600">{item.label}</span>
      {item.type === 'download' ? (
        <button className="text-[#000080] underline" onClick={() => handleDownload(item.label)}>
          {item.value}
        </button>
      ) : item.type === 'specialty' ? (
        <span className="text-[#000080]">{item.value}</span>
      ) : (
        <span className="text-[#000080]">{item.value}</span>
      )}
    </div>
  );

  const renderSection = (
    title: string,
    fields: IReviewExaminerField[],
    showExperienceDetails: boolean = false
  ): JSX.Element => (
    <div className="">
      <div className="px-4 md:p-6">
        <h2 className="my-4 md:mb-6 text-xl font-semibold text-black">{title}</h2>
        <div className="space-y-3">
          {fields.map((field: IReviewExaminerField, index: number) => renderField(field, index))}
          {showExperienceDetails && (
            <div className="mt-4">
              <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#F6F6F6' }}>
                <div className="mb-3">
                  <span className="font-medium text-gray-600">
                    Share Some Details About Your Past Experience
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#000080]">{experienceDetails}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen md:p-6  ">
      <div className="mx-auto md:max-w-6xl">
        <div className="mb-8">
          <div className="md:text-[40px] text-[26px] font-semibold leading-none tracking-tight text-gray-900">
            Review{' '}
            <span className="bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent">
              {examinerData.name}
            </span>{' '}
            Profile
          </div>
        </div>

        <div className="grid grid-cols-1 md:gap-8 gap-2 rounded-4xl bg-white px-0 md:px-4 shadow-sm lg:grid-cols-2">
          <div className="space-y-0">
            {renderSection('Personal & Contact Info', personalContactInfo)}
            <div className="mt-0">{renderSection('Medical Credentials', medicalCredentials)}</div>
          </div>
          <div className="md:space-y-12">
            {renderSection('IME Experience & Qualifications', imeExperience, true)}
            {renderSection('Legal & Compliance', legalCompliance)}
            <div className="">
              <div className="px-4 md:p-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Actions</h2>
                <div className="flex flex-col md:flex-row gap-3">
                  {actions.map((action: IReviewExaminerAction, index: number) => (
                    <button
                      key={index}
                      className={`${action.color} rounded-full px-4 py-2 text-xs font-medium transition-colors`}
                      onClick={() => handleActionClick(action.label)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RequestMoreInfo
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        examinerName={examinerData.name}
      />
      <RejectReason
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
      />
    </div>
  );
};

export default ReviewExaminer;

