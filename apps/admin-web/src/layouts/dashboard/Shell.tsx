import TopHeader from './TopHeader';
import { Suspense } from 'react';

type ShellProps = {
  children: React.ReactNode;
};

const Shell = ({ children }: ShellProps) => {
  return (
    <>
      <TopHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-0 pt-14 sm:pt-20 md:px-8 lg:pt-24">
        <div className="min-h-full w-full max-w-full px-2 py-4 sm:px-4">
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
