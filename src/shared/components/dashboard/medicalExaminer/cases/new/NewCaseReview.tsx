'use client';
import { newCaseclaimantInformation, newCaseInformation } from '@/shared/config/medicalExaminerdashboard/cases/NewCaseReviewData';
import { NewCaseField } from '@/shared/types';
import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';


const NewCaseReview: React.FC = () => {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const handleDownload = (fileName: string) => {
        console.log(`Downloading ${fileName}`);
    };
    const handleAction = (action: string) => {
        console.log(`${action} clicked`);
        if (action === 'More Info') {
            setShowMoreInfo(!showMoreInfo);
        }
    };

    const renderField = (field: NewCaseField, index: number) => (
        <div key={index} className="flex items-center justify-between py-3 px-4 bg-white rounded-lg">
            <span className="font-medium text-[#4E4E4E]">{field.label}</span>
            <span className="text-[#005E8F] font-medium">{field.value}</span>
        </div>
    );

    const renderSection = (title: string, fields: NewCaseField[]) => (
        <div className="rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {fields.map((field, index) => renderField(field, index))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-4">
            <div>
                <div className="mb-4">
                    <h1 className="text-4xl font-semibold text-gray-900">
                        New IME Case Offer:{' '}
                        <span className="text-[#089FEE]">TRV-2049</span>
                    </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 justify-between">
                    <div className="space-y-6">
                        {renderSection('Case Information', newCaseInformation)}
                        <div className="rounded-lg p-6 bg-white">
                            <h3 className="font-medium text-[#4E4E4E] mb-2">
                                Why This Evaluation Is Required
                            </h3>
                            <div className="">
                                <p className="text-[#005E8F] leading-relaxed">This evaluation is required to obtain an independent, expert medical opinion regarding the claimant's current condition, functional limitations, and prognosis. The findings will help determine causation, ongoing treatment needs, and eligibility for insurance benefits related to the reported incident.</p>
                            </div>
                        </div>
                        <div className="rounded-lg p-6 bg-white">
                            <h3 className="font-medium text-[#4E4E4E] mb-2">
                                Special Instructions Or Considerations
                            </h3>
                            <div className="">
                                <p className="text-[#005E8F] leading-relaxed">Please review any pre-existing conditions that may affect the claimant's recovery. Ensure the report includes clear commentary on causation and objective findings. If functional limitations are identified, outline expected duration and any recommended restrictions. Report must be submitted no later than April 30, 2025.</p>
                            </div>
                        </div>
                        <div className="rounded-lg p-6 flex items-center justify-between bg-white">
                            <h3 className="font-medium text-[#4E4E4E]">Supporting Documents</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDownload('Document 1')}
                                    className="text-[#005E8F] underline hover:no-underline"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDownload('Document 2')}
                                    className="text-[#005E8F] underline hover:no-underline"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDownload('Document 3')}
                                    className="text-[#005E8F] underline hover:no-underline"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {renderSection('Claimant Information', newCaseclaimantInformation)}
                        {renderSection('Insurer Information', newCaseclaimantInformation)}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleAction('More Info')}
                                className="flex items-center gap-2 text-[#0096E3] font-medium hover:underline"
                            >
                                More Info
                                <ArrowRight color='black' />
                            </button>
                        </div>
                        <div className="rounded-lg p-">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => handleAction('Request More Info')}
                                    className="bg-[#00A8FF] text-white  cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Request More Info
                                </button>
                                <button
                                    onClick={() => handleAction('Accept Case')}
                                    className="text-[#00A8FF] border border-[#00A8FF] cursor-pointer  bg-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Accept Case
                                </button>
                                <button
                                    onClick={() => handleAction('Decline Offer')}
                                    className="bg-[#B90000] text-white px-6 py-2 cursor-pointer  rounded-full text-sm font-medium transition-colors"
                                >
                                    Decline Offer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewCaseReview;