// 'use client';
// import React from 'react';
// import { ArrowRight } from 'lucide-react';
// import { medicalExaminersData } from '@/shared/config/admindashboard/home/medicalExaminersData';
// import { useRouter } from 'next/navigation';

// const HomeDataTable = () => {
//   const router = useRouter();
//   const handleViewAll = () => {
//     router.push('/dashboard/admin/examiners');
//   };
//   return (
//     <div className="rounded-3xl bg-white px-4 py-6">
//       <div className="mb-6 flex items-center justify-between px-6">
//         <div className="">
//           <h1 className="text-[30px] font-semibold text-black">
//             New{' '}
//             <span
//               className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent"
//               style={{
//                 background: 'linear-gradient(270deg, #01F4C8 46.25%, #00A8FF 78.01%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               Medical
//             </span>{' '}
//             Examiners
//           </h1>
//           <p className="text-[16px] font-normal text-[#676767]">Pending for verification</p>
//         </div>
//         <button
//           onClick={handleViewAll}
//           className="cursor-pointer rounded-3xl bg-[#000093] px-6 py-1.5 text-sm font-normal text-white transition-colors hover:bg-blue-800"
//         >
//           View All
//         </button>
//       </div>

//       <div className="">
//         <div className="rounded-xl bg-[#F3F3F3]">
//           <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-1.5">
//             <div className="text-sm font-semibold text-black">Name</div>
//             <div className="text-sm font-semibold text-black">Specialty</div>
//             <div className="text-sm font-semibold text-black">Submitted On</div>
//             <div className="text-sm font-semibold text-black">Province</div>
//             <div className="w-6 text-sm font-semibold text-black"></div>
//           </div>
//         </div>
//         <div>
//           {medicalExaminersData.map((examiner, index) => (
//             <div
//               key={index}
//               className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center justify-evenly gap-4 border-b border-[#B9B9B9] px-6 py-1.5 transition-colors hover:bg-gray-50"
//             >
//               <div className="text-[12px] text-[#4D4D4D]">{examiner.name}</div>
//               <div className="text-[12px] text-[#4D4D4D]">{examiner.specialty}</div>
//               <div className="text-[12px] text-[#4D4D4D]">{examiner.submittedOn}</div>
//               <div className="text-[12px] text-[#4D4D4D]">{examiner.province}</div>
//               <div className="w-fit">
//                 <button
//                   className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:scale-110"
//                   style={{
//                     background: 'linear-gradient(270deg, #01F4C8 46.25%, #00A8FF 78.01%)',
//                   }}
//                 >
//                   <ArrowRight size={16} strokeWidth={3} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeDataTable;

'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { medicalExaminersData } from '@/shared/config/admindashboard/home/medicalExaminersData';
import { useRouter } from 'next/navigation';

const HomeDataTable = () => {
  const router = useRouter();
  const handleViewAll = () => {
    router.push('/dashboard/admin/examiners');
  };
  return (
    <div className="rounded-3xl bg-white px-4 py-6">
      <div className="mb-6 flex items-center justify-between px-6">
        <div className="">
          <h1 className="text-[30px] font-semibold text-black">
            New{' '}
            <span
              className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(270deg, #01F4C8 46.25%, #00A8FF 78.01%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Medical
            </span>{' '}
            Examiners
          </h1>
          <p className="text-[16px] font-normal text-[#676767]">Pending for verification</p>
        </div>
        <button
          onClick={handleViewAll}
          className="cursor-pointer rounded-3xl bg-[#000093] px-6 py-1.5 text-sm font-normal text-white transition-colors hover:bg-blue-800 max-sm:whitespace-nowrap"
        >
          View All
        </button>
      </div>

      <div className="max-sm:overflow-x-auto">
        <div className="max-sm:min-w-[600px]">
          <div className="rounded-xl bg-[#F3F3F3]">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-1.5">
              <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Name</div>
              <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Specialty</div>
              <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Submitted On</div>
              <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Province</div>
              <div className="w-6 text-sm font-semibold text-black"></div>
            </div>
          </div>
          <div>
            {medicalExaminersData.map((examiner, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center justify-evenly gap-4 border-b border-[#B9B9B9] px-6 py-1.5 transition-colors hover:bg-gray-50"
              >
                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{examiner.name}</div>
                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{examiner.specialty}</div>
                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{examiner.submittedOn}</div>
                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{examiner.province}</div>
                <div className="w-fit">
                  <button
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:scale-110"
                    style={{
                      background: 'linear-gradient(270deg, #01F4C8 46.25%, #00A8FF 78.01%)',
                    }}
                  >
                    <ArrowRight size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDataTable;
