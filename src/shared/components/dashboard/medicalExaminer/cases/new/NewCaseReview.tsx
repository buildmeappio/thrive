'use client';
import { newCaseclaimantInformation, newCaseInformation } from '@/shared/config/medicalExaminerdashboard/cases/NewCaseReviewData';
import { NewCaseField } from '@/shared/types';
import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import RequestDocuments from './RequestDocuments';
import RejectOffer from './RejectOffer';

const NewCaseReview: React.FC = () => {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [isRequestDocumentsOpen, setIsRequestDocumentsOpen] = useState(false);
    const [isRejectOfferOpen, setIsRejectOfferOpen] = useState(false);

    const handleDownload = (fileName: string) => {
        console.log(`Downloading ${fileName}`);
    };

    const handleAction = (action: string) => {
        console.log(`${action} clicked`);
        if (action === 'More Info') {
            setShowMoreInfo(!showMoreInfo);
        } else if (action === 'Request More Info') {
            setIsRequestDocumentsOpen(true);
        } else if (action === 'Decline Offer') {
            setIsRejectOfferOpen(true);
        } else if (action === 'Accept Case') {
            console.log('Accept Case functionality to be implemented');
        }
    };
    const renderField = (field: NewCaseField, index: number) => (
        <div key={index} className="flex items-center justify-between py-2 px-4 bg-white rounded-lg">
            <span className="font-normal text-base text-[#4E4E4E]">{field.label}</span>
            <span className="text-[#005E8F]">{field.value}</span>
        </div>
    );

    const renderSection = (title: string, fields: NewCaseField[]) => (
        <div className="rounded-lg">
            <h3 className="text-[20px] font-semibold text-black mb-2">{title}</h3>
            <div className="space-y-2">
                {fields.map((field, index) => renderField(field, index))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-4">
            <div>
                <div className="mb-6">
                    <h1 className="text-[24px] md:text-[40px] font-semibold text-black">
                        New IME Case Offer:{' '}
                        <span className="text-[#089FEE]">TRV-2049</span>
                    </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 justify-between">
                    <div className="space-y-2">
                        {renderSection('Case Information', newCaseInformation)}
                        <div className="rounded-lg py-2 px-4 bg-white">
                            <h3 className="font-normal text-[#4E4E4E] text-base mb-2">
                                Why This Evaluation Is Required
                            </h3>
                            <div className="">
                                <p className="text-[#005E8F] leading-relaxed">This evaluation is required to obtain an independent, expert medical opinion regarding the claimant's current condition, functional limitations, and prognosis. The findings will help determine causation, ongoing treatment needs, and eligibility for insurance benefits related to the reported incident.</p>
                            </div>
                        </div>
                        <div className="rounded-lg py-2 px-4 bg-white">
                            <h3 className="font-normal text-[#4E4E4E] text-base mb-2">
                                Special Instructions Or Considerations
                            </h3>
                            <div className="">
                                <p className="text-[#005E8F] leading-relaxed">Please review any pre-existing conditions that may affect the claimant's recovery. Ensure the report includes clear commentary on causation and objective findings. If functional limitations are identified, outline expected duration and any recommended restrictions. Report must be submitted no later than April 30, 2025.</p>
                            </div>
                        </div>
                        <div className="rounded-lg py-2 px-4 flex items-start md:items-center justify-between bg-white md:flex-row flex-col">
                            <h3 className="font-normal text-[#4E4E4E] text-base">Supporting Documents</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDownload('Document 1')}
                                    className="text-[#005E8F] font-normal text-base cursor-pointer underline hover:no-underline"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDownload('Document 2')}
                                    className="text-[#005E8F] font-normal text-base cursor-pointer underline hover:no-underline"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDownload('Document 3')}
                                    className="text-[#005E8F] font-normal text-base cursor-pointer underline hover:no-underline"
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
                                className="flex items-center gap-4 text-[#0096E3] text-[24px] font-semibold cursor-pointer hover:underline"
                            >
                                More Info
                                <ArrowRight color='black' strokeWidth={3} />
                            </button>
                        </div>
                        <div className="rounded-lg">
                            <h3 className="text-[24px] font-semibold text-black mb-2">Actions</h3>
                            <div className="flex flex-col md:flex-row gap-3">
                                <button
                                    onClick={() => handleAction('Request More Info')}
                                    className="bg-[#00A8FF] text-white  cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Request More Info
                                </button>
                                <button
                                    onClick={() => handleAction('Decline Offer')}
                                    className="bg-[#B90000] text-white px-6 py-2 cursor-pointer  rounded-full text-sm font-medium transition-colors"
                                >
                                    Decline Offer
                                </button>
                                <button
                                    onClick={() => handleAction('Accept Case')}
                                    className="text-[#00A8FF] border border-[#00A8FF] cursor-pointer  bg-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Accept Case
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RequestDocuments
                isOpen={isRequestDocumentsOpen}
                onClose={() => setIsRequestDocumentsOpen(false)}
            />
            <RejectOffer
                isOpen={isRejectOfferOpen}
                onClose={() => setIsRejectOfferOpen(false)}
            />
        </div>
    );
};

export default NewCaseReview;