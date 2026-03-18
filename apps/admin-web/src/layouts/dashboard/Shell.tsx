import TopHeader from './TopHeader';
import { Suspense } from 'react';

type ShellProps = {
  children: React.ReactNode;
};

const Shell = ({ children }: ShellProps) => {
  return (
    <>
      <TopHeader />

      {/* Main Content - reduced side/top padding so content uses more of the area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-3 pt-14 sm:px-4 sm:pt-20 md:px-5 lg:px-6 lg:pt-24">
        <div className="min-h-full w-full max-w-full pb-3 pt-0 sm:pb-4 sm:pt-0">
          <Suspense
            fallback={
              <div className="flex h-full w-full flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </>
  );
};

export default Shell;
