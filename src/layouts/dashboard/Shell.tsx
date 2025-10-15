import Header from "./Header";
import { Suspense } from "react";

type ShellProps = {
  title: string | React.ReactNode;
  children: React.ReactNode;
};

const Shell = ({ children, title }: ShellProps) => {
  return (
    <>
      <Header title={title} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-0 md:px-8">
        <div className="w-full max-w-full px-4 py-4">
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
