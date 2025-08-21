'use client';

import React from 'react';

const ProfileForm = () => {
  return (
    <div className="space-y-6 mt-4">
      {/* First row: First Name, Last Name, Phone Number */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">First Name<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value="Dr. Sarah"
              className="w-full pl-10 pr-3 py-3 rounded-md  bg-[#F2F5F6] text-[#A4A4A4] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Last Name<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value="Ahmed"
              className="w-full pl-10 pr-3 py-3 rounded-md bg-[#F2F5F6] text-[#A4A4A4] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Phone Number<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="text"
              value="(647) 555-1923"
              className="w-full pl-10 pr-3 py-3 rounded-md  bg-[#F2F5F6] text-[#A4A4A4] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Second row: Email Address, Province of Residence, Mailing Address */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Email Address<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              type="email"
              value="s.ahmed@precisionmed.ca"
              className="w-full pl-10 pr-3 py-3 rounded-md  bg-[#F2F5F6] text-[#A4A4A4] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Province of Residence<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <select className="w-full pl-3 pr-10 py-3 rounded-md  bg-[#F2F5F6] text-[#A4A4A4] text-sm appearance-none">
              <option value="Ontario">Ontario</option>
              <option value="Alberta">Alberta</option>
              <option value="British Columbia">British Columbia</option>
              <option value="Manitoba">Manitoba</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Mailing Address<span className='text-[#FF0000]'>*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value="125 Bay Street, Suite 600"
              className="w-full pl-10 pr-3 py-3 rounded-md  bg-[#F2F5F6] text-[#A4A4A4] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Third row: Profile Photo and Add Bio */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-[#000000] mb-2">Profile Photo<span className='text-[#FF0000]'>*</span></label>
          <div className="mt-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">

            </div>
          </div>
        </div>
        <div className="col-span-9">
          <label className="block text-sm font-medium text-[#000000] mb-2">Add Bio<span className='text-[#FF0000]'>*</span></label>
          <textarea
            rows={5}
            value="I am Dr. Sarah Ahmed, a board-certified orthopedic surgeon with over 12 years of experience conducting Independent Medical Evaluations (IMEs) across personal injury, workplace disability, and accident benefit cases. She has completed more than 350 IMEs to date, serving clients from both plaintiff and defense sides."
            className="w-full rounded-md  px-4 py-3 text-sm bg-[#F2F5F6] text-[#A4A4A4] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
