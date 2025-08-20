// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client';
// import React, { type JSX } from 'react';
// import RequestMoreInfo from '@/shared/components/dashboard/admin/examiners/RequestMoreInfo';

// // Type definitions
// interface ExaminerData {
//   name: string;
//   specialty: string;
//   phone: string;
//   email: string;
//   province: string;
//   address: string;
// }
// interface Field {
//   label: string;
//   value: string;
//   type: 'text' | 'download' | 'specialty';
// }
// interface Action {
//   label: string;
//   type: 'primary' | 'secondary' | 'danger';
//   color: string;
// }

// const ReviewExaminer: React.FC = () => {
//   // Dynamic data objects
//   const examinerData: ExaminerData = {
//     name: 'Dr. Sarah Ahmed',
//     specialty: 'Orthopedic Surgery',
//     phone: '(647) 555-1923',
//     email: 's.ahmed@precisionmed.ca',
//     province: 'Ontario',
//     address: '125 Bay Street, Suite 600',
//   };

//   const personalContactInfo: Field[] = [
//     { label: 'Name', value: examinerData.name, type: 'text' },
//     { label: 'Medical Specialties', value: examinerData.specialty, type: 'specialty' },
//     { label: 'Phone Number', value: examinerData.phone, type: 'text' },
//     { label: 'Email', value: examinerData.email, type: 'text' },
//     { label: 'Province', value: examinerData.province, type: 'text' },
//     { label: 'Mailing Address', value: examinerData.address, type: 'text' },
//   ];

//   const medicalCredentials: Field[] = [
//     { label: 'License Number', value: 'CPSO #09234', type: 'text' },
//     { label: 'Province of Licensure', value: 'Ontario', type: 'text' },
//     { label: 'License Expiry Date', value: 'December 31, 2025', type: 'text' },
//     { label: 'CV / Resume', value: 'Download', type: 'download' },
//     { label: 'Medical License', value: 'Download', type: 'download' },
//   ];

//   const imeExperience: Field[] = [
//     { label: 'Languages Spoken', value: 'English, Urdu', type: 'text' },
//     { label: 'Years of IME Experience', value: '12', type: 'text' },
//   ];

//   const experienceDetails: string = `I am Dr. Sarah Ahmed, a board-certified orthopedic surgeon with over 12 years of experience conducting Independent Medical Evaluations (IMEs) across personal injury, workplace disability, and accident benefit cases. She has completed more than 350 IMEs to date, serving clients from both plaintiff and defense sides.`;

//   const legalCompliance: Field[] = [
//     { label: 'Insurance Proof', value: 'Download', type: 'download' },
//     { label: 'Signed NDA', value: 'Download', type: 'download' },
//   ];

//   const actions: Action[] = [
//     {
//       label: 'Approve Examiner',
//       type: 'primary',
//       color: 'bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent border-2 border-cyan-400',
//     },
//     {
//       label: 'Request More Info',
//       type: 'secondary',
//       color: 'bg-white border-2 border-[#000093] text-[#000093] hover:bg-blue-50',
//     },
//     {
//       label: 'Reject Examiner',
//       type: 'danger',
//       color: 'bg-[#B90000]  text-white border-2 border-[#B90000]',
//     },
//   ];

//   // Handler functions
//   const handleDownload = (fileName: string): void => {
//     console.log(`Downloading ${fileName}`);
//   };

//   const handleActionClick = (actionLabel: string): void => {
//     console.log(`${actionLabel} clicked`);
//   };

//   // Render field function
//   const renderField = (item: Field, index: number): JSX.Element => (
//     <div
//       key={index}
//       className="flex items-center justify-between rounded-lg px-4 py-3"
//       style={{ backgroundColor: '#F6F6F6' }}
//     >
//       <span className="font-medium text-gray-600">{item.label}</span>
//       {item.type === 'download' ? (
//         <button className="text-[#000080] underline" onClick={() => handleDownload(item.label)}>
//           {item.value}
//         </button>
//       ) : item.type === 'specialty' ? (
//         <span className="text-[#000080]">{item.value}</span>
//       ) : (
//         <span className="text-[#000080]">{item.value}</span>
//       )}
//     </div>
//   );

//   // Render section function
//   const renderSection = (
//     title: string,
//     fields: Field[],
//     showExperienceDetails: boolean = false
//   ): JSX.Element => (
//     <div className="">
//       <div className="p-6">
//         <h2 className="mb-6 text-xl font-semibold text-gray-900">{title}</h2>
//         <div className="space-y-3">
//           {fields.map((field: Field, index: number) => renderField(field, index))}
//           {showExperienceDetails && (
//             <div className="mt-4">
//               <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#F6F6F6' }}>
//                 <div className="mb-3">
//                   <span className="font-medium text-gray-600">
//                     Share Some Details About Your Past Experience
//                   </span>
//                 </div>
//                 <p className="text-sm leading-relaxed text-[#000080]">{experienceDetails}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mx-auto max-w-6xl">
//           {/* Header */}
//         <div className="mb-8">
//           <div className="text-4xl font-semibold leading-none tracking-tight text-gray-900">
//             Review{' '}
//             <span className='bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent'>
//               {examinerData.name}
//             </span>
//             {' '}Profile
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-8 rounded-4xl bg-white px-4 shadow-sm lg:grid-cols-2">
//           {/* Left Column */}
//           <div className="space-y-0">
//             {renderSection('Personal & Contact Info', personalContactInfo)}
//             <div className="mt-0">{renderSection('Medical Credentials', medicalCredentials)}</div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {renderSection('IME Experience & Qualifications', imeExperience, true)}
//             {renderSection('Legal & Compliance', legalCompliance)}

//             {/* Actions */}
//             <div className="">
//               <div className="p-6">
//                 <h2 className="mb-6 text-xl font-semibold text-gray-900">Actions</h2>
//                 <div className="flex gap-3">
//                   {actions.map((action: Action, index: number) => (
//                     <button
//                       key={index}
//                       className={`${action.color} rounded-full px-4 py-2 text-xs font-medium transition-colors`}
//                       onClick={() => handleActionClick(action.label)}
//                     >
//                       {action.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReviewExaminer;

'use client';
import React, { useState, type JSX } from 'react';

// Type definitions
interface ExaminerData {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  province: string;
  address: string;
}
interface Field {
  label: string;
  value: string;
  type: 'text' | 'download' | 'specialty';
}
interface Action {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  color: string;
}
interface RequestMoreInfoProps {
  isOpen: boolean;
  onClose: () => void;
  examinerName: string;
}

const RequestMoreInfo: React.FC<RequestMoreInfoProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSend = () => {
    console.log('Sending request for more info:', message);
    // Add your send logic here
    setMessage('');
    setCharCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-4xl shadow-xl w-[650px] h-[350px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 className="text-xl font-semibold text-[#000093]">
            Request More Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#000093] text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write Text Here
            </label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Type here..."
              className="w-full p-3 border border-[#F6F6F6] bg-[#F6F6F6] rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">
                {charCount}/{maxChars}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1 px-6 pb-4">
          <button
            onClick={handleSend}
            disabled={message.trim().length === 0}
            className="w-[155px] h-[41px] bg-[#000080] text-white px-[15.67px] py-2 rounded-[22.5px] font-medium hover:bg-[#000066] disabled:bg-[#000080] disabled:cursor-not-allowed transition-colors gap-[11.25px] rotate-0 opacity-100"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


const ReviewExaminer: React.FC = () => {
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  // Dynamic data objects
  const examinerData: ExaminerData = {
    name: 'Dr. Sarah Ahmed',
    specialty: 'Orthopedic Surgery',
    phone: '(647) 555-1923',
    email: 's.ahmed@precisionmed.ca',
    province: 'Ontario',
    address: '125 Bay Street, Suite 600',
  };

  const personalContactInfo: Field[] = [
    { label: 'Name', value: examinerData.name, type: 'text' },
    { label: 'Medical Specialties', value: examinerData.specialty, type: 'specialty' },
    { label: 'Phone Number', value: examinerData.phone, type: 'text' },
    { label: 'Email', value: examinerData.email, type: 'text' },
    { label: 'Province', value: examinerData.province, type: 'text' },
    { label: 'Mailing Address', value: examinerData.address, type: 'text' },
  ];

  const medicalCredentials: Field[] = [
    { label: 'License Number', value: 'CPSO #09234', type: 'text' },
    { label: 'Province of Licensure', value: 'Ontario', type: 'text' },
    { label: 'License Expiry Date', value: 'December 31, 2025', type: 'text' },
    { label: 'CV / Resume', value: 'Download', type: 'download' },
    { label: 'Medical License', value: 'Download', type: 'download' },
  ];

  const imeExperience: Field[] = [
    { label: 'Languages Spoken', value: 'English, Urdu', type: 'text' },
    { label: 'Years of IME Experience', value: '12', type: 'text' },
  ];

  const experienceDetails: string = `I am Dr. Sarah Ahmed, a board-certified orthopedic surgeon with over 12 years of experience conducting Independent Medical Evaluations (IMEs) across personal injury, workplace disability, and accident benefit cases. She has completed more than 350 IMEs to date, serving clients from both plaintiff and defense sides.`;

  const legalCompliance: Field[] = [
    { label: 'Insurance Proof', value: 'Download', type: 'download' },
    { label: 'Signed NDA', value: 'Download', type: 'download' },
  ];

  const actions: Action[] = [
    {
      label: 'Approve Examiner',
      type: 'primary',
      color: 'bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent border-2 border-cyan-400',
    },
    {
      label: 'Request More Info',
      type: 'secondary',
      color: 'bg-white border-2 border-[#000093] text-[#000093] hover:bg-blue-50',
    },
    {
      label: 'Reject Examiner',
      type: 'danger',
      color: 'bg-[#B90000] text-white border-2 border-[#B90000]',
    },
  ];

  // Handler functions
  const handleDownload = (fileName: string): void => {
    console.log(`Downloading ${fileName}`);
  };

  const handleActionClick = (actionLabel: string): void => {
    console.log(`${actionLabel} clicked`);
    if (actionLabel === 'Request More Info') {
      setIsRequestOpen(true);
    }
  };

  // Render field function
  const renderField = (item: Field, index: number): JSX.Element => (
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

  // Render section function
  const renderSection = (
    title: string,
    fields: Field[],
    showExperienceDetails: boolean = false
  ): JSX.Element => (
    <div className="">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{title}</h2>
        <div className="space-y-3">
          {fields.map((field: Field, index: number) => renderField(field, index))}
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
    <div className="min-h-screen bg-gray-50 md:p-6" >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-4xl font-semibold leading-none tracking-tight text-gray-900">
            Review{' '}
            <span className="bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent">
              {examinerData.name}
            </span>{' '}
            Profile
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-4xl bg-white px-4 shadow-sm lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-0">
            {renderSection('Personal & Contact Info', personalContactInfo)}
            <div className="mt-0">{renderSection('Medical Credentials', medicalCredentials)}</div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {renderSection('IME Experience & Qualifications', imeExperience, true)}
            {renderSection('Legal & Compliance', legalCompliance)}

            {/* Actions */}
            <div className="">
              <div className="p-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Actions</h2>
                {/* Changed the button container to be a column on mobile and a row on larger screens */}
                <div className="flex flex-col md:flex-row gap-3">
                  {actions.map((action: Action, index: number) => (
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

      {/* Render RequestMoreInfo modal */}
      <RequestMoreInfo
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        examinerName={examinerData.name}
      />
    </div>
  );
};

export default ReviewExaminer;
