import { PublicHeader } from '@/layouts/public';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white">
      <PublicHeader />
      {children}
    </div>
  );
};

export default PublicLayout;
