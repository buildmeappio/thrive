import { Suspense } from "react";
import SuccessPageContent from "@/domains/auth/components/SuccessPage";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default Page;
