import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { OrganizationFeatures } from '@/config/landing';

export const metadata: Metadata = {
  title: 'Get Started Organization | Thrive',
  description: 'Get Started with Thrive',
};

const Page = async () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFF] md:flex-row">
      <div className="mt-8 flex-shrink-0 px-6 md:mt-16 md:w-[60%] md:px-0 md:pl-20">
        <div className="space-y-6">
          <div className="">
            <h1 className="text-[24px] font-bold text-gray-900 md:text-[40px]">
              Independent Medical
            </h1>
            <h2 className="text-[24px] font-bold md:text-[40px]">
              Examinations for{' '}
              <span
                className="text-[24px] font-bold md:text-[40px]"
                style={{
                  color: '#000080',
                }}
              >
                Organization
              </span>
            </h2>
            <p className="max-w-[100%] text-[16px] text-[#636363] md:max-w-[80%] md:text-base">
              Thrive helps insurance companies, government agencies, & regulatory bodies manage
              independent medical examinations with speed, accuracy, and total transparency — all
              from one secure platform.
            </p>
          </div>
          <form
            action={async () => {
              'use server';
              redirect('/register/organization');
            }}
          >
            <button
              // onClick={handleGetStarted}
              className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #000080 0%, #5151B9 100%)',
              }}
            >
              Let's Get Started
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </form>
        </div>

        <div className="relative -mx-6 mt-8 mb-8 md:hidden">
          <Image
            src="/images/org-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={400}
            height={400}
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>

        <div className="mt-8 space-y-4 md:mt-10">
          <h3 className="text-lg font-semibold text-[#000000]">Fully Compliant & Confidential</h3>
          <ul className="space-y-3 pb-4">
            {OrganizationFeatures.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Check
                  size={13}
                  strokeWidth={5}
                  className="mt-1 flex-shrink-0"
                  style={{ color: '#000080' }}
                />
                <span className="flex-1 text-xs leading-relaxed text-[#333333] md:text-sm">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-16 hidden flex-1 overflow-hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/images/org-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={200}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
