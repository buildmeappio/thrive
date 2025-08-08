// import Image from "next/image";
// import { ArrowRight, Check } from "lucide-react";
// import { OrganizationFeatures } from "~/config/GettingStartedFeatures.config";
// import type { OrganizationGettingStartedProps } from "~/types";

// export const OrganizationGettingStarted: React.FC<
//   OrganizationGettingStartedProps
// > = ({ onGetStarted }) => {
//   return (
//     <div className="flex min-h-screen bg-[#FAFAFF]">
//       <div className="mt-16 w-[60%] flex-shrink-0 pl-20">
//         <div className="space-y-6">
//           <div className="">
//             <h1 className="text-[40px] font-bold text-gray-900">
//               Independent Medical
//             </h1>
//             <h2 className="text-[40px] font-bold">
//               Examinations for{" "}
//               <span
//                 className="text-[40px] font-bold"
//                 style={{
//                   color: "#000080",
//                 }}
//               >
//                 Organization
//               </span>
//             </h2>
//             <p className="text-base text-[#636363] max-w-[80%]">
//               Thrive helps insurance companies, government agencies, &
//               regulatory bodies manage independent medical examinations with
//               speed, accuracy, and total transparency — all from one secure
//               platform.
//             </p>
//           </div>

//           <button
//             onClick={onGetStarted}
//             className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
//             style={{
//               background: "linear-gradient(90deg, #000080 0%, #5151B9 100%)",
//             }}
//           >
//             Let's Get Started
//             <ArrowRight size={20} strokeWidth={3} />
//           </button>

//           <div className="mt-10 space-y-4">
//             <h3 className="text-lg font-semibold text-[#000000]">
//               Fully Compliant & Confidential
//             </h3>
//             <ul className="space-y-3 pb-4">
//               {OrganizationFeatures.map((feature, index) => (
//                 <li key={index} className="flex items-center space-x-1">
//                   <Check
//                     size={13}
//                     strokeWidth={5}
//                     style={{ color: "#000080" }}
//                   />
//                   <span className="text-sm leading-relaxed text-[#333333]">
//                     {feature}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>

//       <div className="relative mt-16 flex-1 overflow-hidden">
//         <div className="absolute inset-0">
//           <Image
//             src="/org-gettingStarted.png"
//             alt="Admin Dashboard Preview"
//             width={200}
//             height={200}
//             className="h-full w-full"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };


import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { OrganizationFeatures } from "~/config/GettingStartedFeatures.config";
import type { OrganizationGettingStartedProps } from "~/types";

export const OrganizationGettingStarted: React.FC<
  OrganizationGettingStartedProps
> = ({ onGetStarted }) => {
  return (
    <div className="flex min-h-screen bg-[#FAFAFF] flex-col md:flex-row">
      <div className="mt-8 px-6 flex-shrink-0 md:mt-16 md:w-[60%] md:pl-20 md:px-0">
        <div className="space-y-6">
          <div className="">
            <h1 className="text-[24px] font-bold text-gray-900 md:text-[40px]">
              Independent Medical
            </h1>
            <h2 className="text-[24px] font-bold md:text-[40px]">
              Examinations for{" "}
              <span
                className="text-[24px] font-bold md:text-[40px]"
                style={{
                  color: "#000080",
                }}
              >
                Organization
              </span>
            </h2>
            <p className="text-[16px] text-[#636363] max-w-[100%] md:text-base md:max-w-[80%]">
              Thrive helps insurance companies, government agencies, &
              regulatory bodies manage independent medical examinations with
              speed, accuracy, and total transparency — all from one secure
              platform.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(90deg, #000080 0%, #5151B9 100%)",
            }}
          >
            Let's Get Started
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
        
        {/* Image section - shows after button on mobile, hidden on desktop */}
        <div className="relative mt-8 mb-8 -mx-6 md:hidden">
          <Image
            src="/org-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={400}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        
        {/* Features section - shows at bottom on mobile, at original position on desktop */}
        <div className="mt-8 space-y-4 md:mt-10">
          <h3 className="text-lg font-semibold text-[#000000]">
            Fully Compliant & Confidential
          </h3>
          <ul className="space-y-3 pb-4">
            {OrganizationFeatures.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Check
                  size={13}
                  strokeWidth={5}
                  className="mt-1 flex-shrink-0"
                  style={{ color: "#000080" }}
                />
                <span className="text-xs leading-relaxed text-[#333333] md:text-sm flex-1">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Original image section - hidden on mobile, shows on desktop */}
      <div className="relative mt-16 flex-1 overflow-hidden hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/org-gettingStarted.png"
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