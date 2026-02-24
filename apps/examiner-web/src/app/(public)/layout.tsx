import Header from '@/layouts/public/header';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main role="main" className="flex-1 bg-[#F4FBFF]">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
