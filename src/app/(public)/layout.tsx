import { PublicHeader } from '@/layouts/public';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <PublicHeader />
      {children}
    </div>
  );
};

export default PublicLayout;
