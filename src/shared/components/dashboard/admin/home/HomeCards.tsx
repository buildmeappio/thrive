// 'use client';
// import { ArrowUpRight } from 'lucide-react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import React from 'react';

// const HomeCards = () => {
//   const router = useRouter();
//   const handleExaminerClick = () => {
//     router.push('/dashboard/admin/examiners');
//   };
//   const handleInsurerClick = () => {
//     router.push('/dashboard/admin/referrals');
//   };
//   const handleActiveIMEClick = () => {
//     router.push('/dashboard/admin/schedule');
//   };
//   return (
//     <div className="flex flex-col gap-4">
//       <h1 className="font-degular text-[36px] leading-[48px] font-semibold text-black">
//         Welcome To{' '}
//         <span className="bg-gradient-to-l from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
//           Thrive
//         </span>{' '}
//         Admin Dashboard
//       </h1>

//       <div className="grid grid-cols-3 gap-4">
//         <div className="flex h-full w-full flex-col gap-1 rounded-3xl bg-[#00A8FF] p-4">
//           <div className="flex items-center justify-between">
//             <Image src="/images/doctor.png" alt="examiner" width={16} height={16} />
//             <div className="w-fit rounded-full bg-[#0037A5] px-4 py-1.5">
//               <h4 className="text-[12px] font-normal text-white">This Month</h4>
//             </div>
//           </div>
//           <h4 className="font-poppins text-[18px] font-semibold text-white">New Examiners</h4>
//           <div className="-mt-2 flex items-center justify-between">
//             <h4 className="font-poppins text-[30px] font-semibold text-white">20</h4>
//             <div
//               onClick={handleExaminerClick}
//               className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#000080]"
//             >
//               <ArrowUpRight color="white" size={16} />
//             </div>
//           </div>
//         </div>
//         <div className="flex h-full w-full flex-col gap-1 rounded-3xl bg-[#000080] p-4">
//           <div className="flex items-center justify-between">
//             <Image src="/images/insurers.png" alt="insurer" width={20} height={20} />
//             <div className="w-fit rounded-full bg-[#0000BD] px-4 py-1.5">
//               <h4 className="text-[12px] font-normal text-white">This Month</h4>
//             </div>
//           </div>
//           <h4 className="font-poppins text-[18px] font-semibold text-white">New Insurers</h4>
//           <div className="-mt-2 flex items-center justify-between">
//             <h4 className="font-poppins text-[30px] font-semibold text-white">6</h4>
//             <div
//               onClick={handleInsurerClick}
//               className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#00A8FF]"
//             >
//               <ArrowUpRight color="white" size={16} />
//             </div>
//           </div>
//         </div>
//         <div
//           className="flex h-full w-full flex-col gap-1 rounded-3xl p-4"
//           style={{ background: 'linear-gradient(270deg, #01F4C8 0%, #00A8FF 100%)' }}
//         >
//           <div className="flex items-center justify-between">
//             <Image src="/images/alert.png" alt="alert" width={20} height={20} />
//             <div className="w-fit rounded-full bg-[#006599] px-4 py-1.5">
//               <h4 className="text-[12px] font-normal text-white">All Time</h4>
//             </div>
//           </div>
//           <h4 className="font-poppins text-[18px] font-semibold text-white">Active IME Cases</h4>
//           <div className="-mt-2 flex items-center justify-between">
//             <h4 className="font-poppins text-[30px] font-semibold text-white">12</h4>
//             <div
//               onClick={handleActiveIMEClick}
//               className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#000080]"
//             >
//               <ArrowUpRight color="white" size={16} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeCards;

'use client';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const HomeCards = () => {
  const router = useRouter();
  const handleExaminerClick = () => {
    router.push('/dashboard/admin/examiners');
  };
  const handleInsurerClick = () => {
    router.push('/dashboard/admin/referrals');
  };
  const handleActiveIMEClick = () => {
    router.push('/dashboard/admin/schedule');
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-degular text-[36px] leading-[48px] font-semibold text-black">
        Welcome To{' '}
        <span className="bg-gradient-to-l from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
          Thrive
        </span>{' '}
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex h-full w-full flex-col gap-1 rounded-3xl bg-[#00A8FF] p-4">
          <div className="flex items-center justify-between md:flex-row flex-col md:items-center items-start">
            <div className="flex flex-col md:flex-row md:items-center items-start gap-1">
              <Image src="/images/doctor.png" alt="examiner" width={16} height={16} />
              <div className="md:hidden w-fit rounded-full bg-[#0037A5] px-4 py-1.5">
                <h4 className="text-[12px] font-normal text-white whitespace-nowrap">This Month</h4>
              </div>
            </div>
            <div className="hidden md:block w-fit rounded-full bg-[#0037A5] px-4 py-1.5">
              <h4 className="text-[12px] font-normal text-white">This Month</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">New Examiners</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[30px] font-semibold text-white">20</h4>
            <div
              onClick={handleExaminerClick}
              className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#000080]"
            >
              <ArrowUpRight color="white" size={16} />
            </div>
          </div>
        </div>
        <div className="flex h-full w-full flex-col gap-1 rounded-3xl bg-[#000080] p-4">
          <div className="flex items-center justify-between md:flex-row flex-col md:items-center items-start">
            <div className="flex flex-col md:flex-row md:items-center items-start gap-1">
              <Image src="/images/insurers.png" alt="insurer" width={20} height={20} />
              <div className="md:hidden w-fit rounded-full bg-[#0000BD] px-4 py-1.5">
                <h4 className="text-[12px] font-normal text-white whitespace-nowrap">This Month</h4>
              </div>
            </div>
            <div className="hidden md:block w-fit rounded-full bg-[#0000BD] px-4 py-1.5">
              <h4 className="text-[12px] font-normal text-white">This Month</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">New Insurers</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[30px] font-semibold text-white">6</h4>
            <div
              onClick={handleInsurerClick}
              className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#00A8FF]"
            >
              <ArrowUpRight color="white" size={16} />
            </div>
          </div>
        </div>
        <div
          className="flex h-full w-full flex-col gap-1 rounded-3xl p-4"
          style={{ background: 'linear-gradient(270deg, #01F4C8 0%, #00A8FF 100%)' }}
        >
          <div className="flex items-center justify-between md:flex-row flex-col md:items-center items-start">
            <div className="flex flex-col md:flex-row md:items-center items-start gap-1">
              <Image src="/images/alert.png" alt="alert" width={20} height={20} />
              <div className="md:hidden w-fit rounded-full bg-[#006599] px-4 py-1.5">
                <h4 className="text-[12px] font-normal text-white whitespace-nowrap">All Time</h4>
              </div>
            </div>
            <div className="hidden md:block w-fit rounded-full bg-[#006599] px-4 py-1.5">
              <h4 className="text-[12px] font-normal text-white">All Time</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">Active IME Cases</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[30px] font-semibold text-white">12</h4>
            <div
              onClick={handleActiveIMEClick}
              className="mt-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#000080]"
            >
              <ArrowUpRight color="white" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCards;
